using System.ComponentModel.DataAnnotations;

namespace FlowForge.Application.Features.Webhooks.CreateWebhook;

/// <summary>
/// Request to create a new webhook subscription.
/// </summary>
public sealed class CreateWebhookRequest
{
    /// <summary>
    /// Display name for the webhook.
    /// </summary>
    [Required]
    [StringLength(100)]
    public string Name { get; init; } = string.Empty;

    /// <summary>
    /// The URL to send webhook payloads to.
    /// </summary>
    [Required]
    [Url]
    [StringLength(500)]
    public string Url { get; init; } = string.Empty;

    /// <summary>
    /// Optional secret for HMAC signature verification.
    /// </summary>
    [StringLength(100)]
    public string? Secret { get; init; }

    /// <summary>
    /// Comma-separated list of event types to subscribe to.
    /// </summary>
    [Required]
    [StringLength(1000)]
    public string EventTypes { get; init; } = string.Empty;

    /// <summary>
    /// The organization ID for the webhook.
    /// </summary>
    [Required]
    public Guid OrganizationId { get; init; }
}