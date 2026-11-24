namespace FlowForge.Application.Features.Webhooks.UpdateWebhook;

/// <summary>
/// Response after updating a webhook subscription.
/// </summary>
public sealed class UpdateWebhookResponse
{
    /// <summary>
    /// The ID of the updated webhook subscription.
    /// </summary>
    public Guid Id { get; init; }

    /// <summary>
    /// The name of the webhook.
    /// </summary>
    public string Name { get; init; } = string.Empty;

    /// <summary>
    /// The URL the webhook sends payloads to.
    /// </summary>
    public string Url { get; init; } = string.Empty;

    /// <summary>
    /// Comma-separated list of subscribed event types.
    /// </summary>
    public string EventTypes { get; init; } = string.Empty;

    /// <summary>
    /// Whether the webhook is active.
    /// </summary>
    public bool IsActive { get; init; }
}