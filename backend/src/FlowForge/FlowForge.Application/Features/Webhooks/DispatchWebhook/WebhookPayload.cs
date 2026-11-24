namespace FlowForge.Application.Features.Webhooks.DispatchWebhook;

/// <summary>
/// Event data dispatched to a webhook endpoint.
/// </summary>
public sealed class WebhookPayload
{
    /// <summary>
    /// The type of event that triggered this webhook.
    /// </summary>
    public string EventType { get; init; } = string.Empty;

    /// <summary>
    /// UTC timestamp when the event occurred.
    /// </summary>
    public DateTime Timestamp { get; init; } = DateTime.UtcNow;

    /// <summary>
    /// The organization ID associated with the event.
    /// </summary>
    public Guid OrganizationId { get; init; }

    /// <summary>
    /// The payload data specific to the event type.
    /// </summary>
    public object Data { get; init; } = new();
}