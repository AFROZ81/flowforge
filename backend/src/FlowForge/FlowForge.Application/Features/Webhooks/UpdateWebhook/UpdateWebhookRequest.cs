using System.ComponentModel.DataAnnotations;

namespace FlowForge.Application.Features.Webhooks.UpdateWebhook;

/// <summary>
/// Request to update a webhook subscription.
/// </summary>
public sealed class UpdateWebhookRequest
{
    /// <summary>
    /// Display name for the webhook.
    /// </summary>
    [StringLength(100)]
    public string? Name { get; init; }

    /// <summary>
    /// The URL to send webhook payloads to.
    /// </summary>
    [Url]
    [StringLength(500)]
    public string? Url { get; init; }

    /// <summary>
    /// Optional secret for HMAC signature verification.
    /// </summary>
    [StringLength(100)]
    public string? Secret { get; init; }

    /// <summary>
    /// Comma-separated list of event types to subscribe to.
    /// </summary>
    [StringLength(1000)]
    public string? EventTypes { get; init; }

    /// <summary>
    /// Whether the webhook is active.
    /// </summary>
    public bool? IsActive { get; init; }
}