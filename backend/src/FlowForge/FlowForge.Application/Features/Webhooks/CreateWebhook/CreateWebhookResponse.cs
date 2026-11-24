namespace FlowForge.Application.Features.Webhooks.CreateWebhook;

/// <summary>
/// Response after creating a webhook subscription.
/// </summary>
public sealed class CreateWebhookResponse
{
    /// <summary>
    /// The ID of the created webhook subscription.
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