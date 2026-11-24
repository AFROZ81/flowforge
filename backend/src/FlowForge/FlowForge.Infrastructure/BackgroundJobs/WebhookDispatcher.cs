using FlowForge.Application.Interfaces;
using FlowForge.Application.Services.Webhooks;
using FlowForge.Domain.Entities;
using FlowForge.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace FlowForge.Infrastructure.BackgroundJobs;

/// <summary>
/// Background service that dispatches webhook events to subscribed endpoints.
/// </summary>
public sealed class WebhookDispatcher : BackgroundService, IWebhookDispatcher
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<WebhookDispatcher> _logger;
    private readonly System.Collections.Concurrent.ConcurrentQueue<WebhookQueueItem> _queue = new();
    private readonly SemaphoreSlim _semaphore = new(0);

    public WebhookDispatcher(IServiceScopeFactory scopeFactory, ILogger<WebhookDispatcher> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    public Task DispatchAsync(WebhookEventType eventType, Guid organizationId, object data, CancellationToken cancellationToken = default)
    {
        var item = new WebhookQueueItem
        {
            EventType = eventType,
            OrganizationId = organizationId,
            Data = data,
            Timestamp = DateTime.UtcNow,
        };

        _queue.Enqueue(item);
        _semaphore.Release();

        return Task.CompletedTask;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Webhook dispatcher started.");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await _semaphore.WaitAsync(stoppingToken);

                while (_queue.TryDequeue(out var item))
                {
                    if (stoppingToken.IsCancellationRequested)
                        break;

                    await ProcessQueueItemAsync(item, stoppingToken);
                }
            }
            catch (OperationCanceledException)
            {
                break;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing webhook queue.");
                await Task.Delay(1000, stoppingToken);
            }
        }

        _logger.LogInformation("Webhook dispatcher stopped.");
    }

    private async Task ProcessQueueItemAsync(WebhookQueueItem item, CancellationToken cancellationToken)
    {
        using var scope = _scopeFactory.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<IApplicationDbContext>();

        var subscriptions = await context.WebhookSubscriptions
            .AsNoTracking()
            .Where(w =>
                w.OrganizationId == item.OrganizationId &&
                w.IsActive &&
                !w.IsDeleted &&
                w.EventTypes.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                    .Contains(item.EventType.ToString(), StringComparer.OrdinalIgnoreCase))
            .ToListAsync(cancellationToken);

        if (subscriptions.Count == 0)
            return;

        var payload = new
        {
            eventType = item.EventType.ToString(),
            timestamp = item.Timestamp,
            organizationId = item.OrganizationId,
            data = item.Data,
        };

        var json = System.Text.Json.JsonSerializer.Serialize(payload);

        foreach (var subscription in subscriptions)
        {
            try
            {
                using var httpClient = new HttpClient();
                httpClient.Timeout = TimeSpan.FromSeconds(30);

                var content = new StringContent(
                    System.Text.Json.JsonSerializer.Serialize(new
                    {
                        eventType = item.EventType.ToString(),
                        timestamp = item.Timestamp,
                        organizationId = item.OrganizationId,
                        data = item.Data,
                    }),
                    System.Text.Encoding.UTF8,
                    "application/json");

                if (!string.IsNullOrEmpty(subscription.Secret))
                {
                    var signature = ComputeHmacSha256(json, subscription.Secret);
                    content.Headers.Add("X-FlowForge-Signature", signature);
                }

                content.Headers.Add("X-FlowForge-Event", item.EventType.ToString());
                content.Headers.Add("X-FlowForge-Timestamp", item.Timestamp.ToString("O"));
                content.Headers.Add("X-FlowForge-Delivery", Guid.NewGuid().ToString());

                var response = await httpClient.PostAsync(subscription.Url, content, cancellationToken);

                if (response.IsSuccessStatusCode)
                {
                    subscription.ConsecutiveFailures = 0;
                    subscription.LastTriggeredAt = DateTime.UtcNow;
                    subscription.LastFailureReason = null;
                }
                else
                {
                    HandleFailure(subscription, (int)response.StatusCode, $"HTTP {(int)response.StatusCode}: {response.ReasonPhrase}");
                }

                await context.SaveChangesAsync(cancellationToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to deliver webhook to {Url} for organization {OrgId}", subscription.Url, subscription.OrganizationId);

                subscription.ConsecutiveFailures++;
                subscription.LastFailedAt = DateTime.UtcNow;
                subscription.LastFailureReason = ex.Message;

                if (subscription.ConsecutiveFailures >= 10)
                {
                    subscription.IsActive = false;
                    _logger.LogWarning("Webhook {WebhookId} disabled after 10 consecutive failures.", subscription.Id);
                }

                await context.SaveChangesAsync(cancellationToken);
            }
        }
    }

    private static void HandleFailure(WebhookSubscription subscription, int statusCode, string reason)
    {
        subscription.ConsecutiveFailures++;
        subscription.LastFailedAt = DateTime.UtcNow;
        subscription.LastFailureReason = reason;

        if (subscription.ConsecutiveFailures >= 10)
        {
            subscription.IsActive = false;
        }
    }

    private static string ComputeHmacSha256(string payload, string secret)
    {
        using var hmac = new System.Security.Cryptography.HMACSHA256(System.Text.Encoding.UTF8.GetBytes(secret));
        var hash = hmac.ComputeHash(System.Text.Encoding.UTF8.GetBytes(payload));
        return Convert.ToBase64String(hash);
    }

    private sealed class WebhookQueueItem
    {
        public WebhookEventType EventType { get; init; }
        public Guid OrganizationId { get; init; }
        public object Data { get; init; } = new();
        public DateTime Timestamp { get; init; }
    }
}