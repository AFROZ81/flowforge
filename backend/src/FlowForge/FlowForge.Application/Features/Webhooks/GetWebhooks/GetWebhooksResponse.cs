namespace FlowForge.Application.Features.Webhooks.GetWebhooks;

/// <summary>
/// Response item for listing webhook subscriptions.
/// </summary>
public sealed class GetWebhooksResponse
{
    /// <summary>
    /// The ID of the webhook subscription.
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

    /// <summary>
    /// Number of consecutive delivery failures.
    /// </summary>
    public int ConsecutiveFailures { get; init; }

    /// <summary>
    /// UTC timestamp when the webhook was last triggered.
    /// </summary>
    public DateTime? LastTriggeredAt { get; init; }

    /// <summary>
    /// UTC timestamp when the webhook last failed.
    /// </summary>
    public DateTime? LastFailedAt { get; init; }

    /// <summary>
    /// Reason for the last failure.
    /// </summary>
    public string? LastFailureReason { get; init; }

    /// <summary>
    /// UTC timestamp when the subscription was created.
    /// </summary>
    public DateTime CreatedAt { get; init; }
}