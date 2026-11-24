using System.ComponentModel.DataAnnotations;

namespace FlowForge.Application.Features.Webhooks.TestWebhook;

/// <summary>
/// Request to test a webhook subscription.
/// </summary>
public sealed class TestWebhookRequest
{
    /// <summary>
    /// The ID of the webhook subscription to test.
    /// </summary>
    [Required]
    public Guid Id { get; init; }
}