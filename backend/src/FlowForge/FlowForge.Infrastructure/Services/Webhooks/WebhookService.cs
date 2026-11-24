using FlowForge.Application.Features.Webhooks.CreateWebhook;
using FlowForge.Application.Features.Webhooks.DeleteWebhook;
using FlowForge.Application.Features.Webhooks.GetWebhooks;
using FlowForge.Application.Features.Webhooks.TestWebhook;
using FlowForge.Application.Features.Webhooks.UpdateWebhook;
using FlowForge.Application.Interfaces;
using FlowForge.Application.Services.Webhooks;
using FlowForge.Domain.Entities;
using FlowForge.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace FlowForge.Infrastructure.Services.Webhooks;

/// <summary>
/// Handles webhook subscription management.
/// </summary>
public sealed class WebhookService : IWebhookService
{
    private readonly IApplicationDbContext _context;

    public WebhookService(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<CreateWebhookResponse> CreateAsync(CreateWebhookRequest request, CancellationToken cancellationToken = default)
    {
        var subscription = new WebhookSubscription
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Url = request.Url,
            Secret = request.Secret,
            EventTypes = request.EventTypes,
            OrganizationId = request.OrganizationId,
            IsActive = true,
        };

        _context.WebhookSubscriptions.Add(subscription);
        await _context.SaveChangesAsync(cancellationToken);

        return new CreateWebhookResponse
        {
            Id = subscription.Id,
            Name = subscription.Name,
            Url = subscription.Url,
            EventTypes = subscription.EventTypes,
            IsActive = subscription.IsActive,
        };
    }

    public async Task<List<GetWebhooksResponse>> GetAsync(Guid organizationId, CancellationToken cancellationToken = default)
    {
        return await _context.WebhookSubscriptions
            .AsNoTracking()
            .Where(w => w.OrganizationId == organizationId && !w.IsDeleted)
            .OrderByDescending(w => w.CreatedAt)
            .Select(w => new GetWebhooksResponse
            {
                Id = w.Id,
                Name = w.Name,
                Url = w.Url,
                EventTypes = w.EventTypes,
                IsActive = w.IsActive,
                ConsecutiveFailures = w.ConsecutiveFailures,
                LastTriggeredAt = w.LastTriggeredAt,
                LastFailedAt = w.LastFailedAt,
                LastFailureReason = w.LastFailureReason,
                CreatedAt = w.CreatedAt,
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<UpdateWebhookResponse> UpdateAsync(Guid id, UpdateWebhookRequest request, CancellationToken cancellationToken = default)
    {
        var subscription = await _context.WebhookSubscriptions
            .FirstOrDefaultAsync(w => w.Id == id && !w.IsDeleted, cancellationToken);

        if (subscription == null)
            throw new KeyNotFoundException("Webhook subscription not found.");

        if (request.Name is not null)
            subscription.Name = request.Name;

        if (request.Url is not null)
            subscription.Url = request.Url;

        if (request.Secret is not null)
            subscription.Secret = request.Secret;

        if (request.EventTypes is not null)
            subscription.EventTypes = request.EventTypes;

        if (request.IsActive.HasValue)
            subscription.IsActive = request.IsActive.Value;

        await _context.SaveChangesAsync(cancellationToken);

        return new UpdateWebhookResponse
        {
            Id = subscription.Id,
            Name = subscription.Name,
            Url = subscription.Url,
            EventTypes = subscription.EventTypes,
            IsActive = subscription.IsActive,
        };
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var subscription = await _context.WebhookSubscriptions
            .FirstOrDefaultAsync(w => w.Id == id && !w.IsDeleted, cancellationToken);

        if (subscription == null)
            throw new KeyNotFoundException("Webhook subscription not found.");

        subscription.IsDeleted = true;
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task<TestWebhookResponse> TestAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var subscription = await _context.WebhookSubscriptions
            .FirstOrDefaultAsync(w => w.Id == id && !w.IsDeleted, cancellationToken);

        if (subscription == null)
            throw new KeyNotFoundException("Webhook subscription not found.");

        if (!subscription.IsActive)
            return new TestWebhookResponse { Success = false, Error = "Webhook is not active." };

        var payload = new
        {
            eventType = "webhook.test",
            timestamp = DateTime.UtcNow,
            organizationId = subscription.OrganizationId,
            data = new { message = "Test webhook from FlowForge" },
        };

        try
        {
            using var httpClient = new HttpClient();
            httpClient.Timeout = TimeSpan.FromSeconds(10);

            var json = System.Text.Json.JsonSerializer.Serialize(payload);
            var content = new StringContent(json, System.Text.Encoding.UTF8, "application/json");

            if (!string.IsNullOrEmpty(subscription.Secret))
            {
                var signature = ComputeHmacSha256(json, subscription.Secret);
                content.Headers.Add("X-FlowForge-Signature", signature);
            }

            var response = await httpClient.PostAsync(subscription.Url, content, cancellationToken);
            var responseBody = await response.Content.ReadAsStringAsync(cancellationToken);

            return new TestWebhookResponse
            {
                Success = response.IsSuccessStatusCode,
                StatusCode = (int)response.StatusCode,
                ResponseBody = responseBody,
            };
        }
        catch (Exception ex)
        {
            return new TestWebhookResponse
            {
                Success = false,
                Error = ex.Message,
            };
        }
    }

    private static string ComputeHmacSha256(string payload, string secret)
    {
        using var hmac = new System.Security.Cryptography.HMACSHA256(System.Text.Encoding.UTF8.GetBytes(secret));
        var hash = hmac.ComputeHash(System.Text.Encoding.UTF8.GetBytes(payload));
        return Convert.ToBase64String(hash);
    }
}