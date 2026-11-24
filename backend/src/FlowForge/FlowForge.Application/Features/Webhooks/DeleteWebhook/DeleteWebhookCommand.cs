using MediatR;

namespace FlowForge.Application.Features.Webhooks.DeleteWebhook;

/// <summary>
/// Command to delete a webhook subscription.
/// </summary>
public sealed class DeleteWebhookCommand : IRequest
{
    public Guid Id { get; init; }
}