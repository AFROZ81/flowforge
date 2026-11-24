namespace FlowForge.Application.Services.Webhooks;

/// <summary>
/// Interface for dispatching webhook events.
/// </summary>
public interface IWebhookDispatcher
{
    /// <summary>
    /// Dispatches a webhook event to all matching subscriptions.
    /// </summary>
    Task DispatchAsync(
        FlowForge.Domain.Enums.WebhookEventType eventType,
        Guid organizationId,
        object data,
        CancellationToken cancellationToken = default);
}