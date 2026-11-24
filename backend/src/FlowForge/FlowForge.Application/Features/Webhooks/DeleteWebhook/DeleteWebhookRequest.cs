using System.ComponentModel.DataAnnotations;

namespace FlowForge.Application.Features.Webhooks.DeleteWebhook;

/// <summary>
/// Request to delete a webhook subscription.
/// </summary>
public sealed class DeleteWebhookRequest
{
    /// <summary>
    /// The ID of the webhook subscription to delete.
    /// </summary>
    [Required]
    public Guid Id { get; init; }
}