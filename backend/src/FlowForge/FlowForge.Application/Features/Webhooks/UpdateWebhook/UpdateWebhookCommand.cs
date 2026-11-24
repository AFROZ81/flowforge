using MediatR;

namespace FlowForge.Application.Features.Webhooks.UpdateWebhook;

/// <summary>
/// Command to update a webhook subscription.
/// </summary>
public sealed class UpdateWebhookCommand : IRequest<UpdateWebhookResponse>
{
    public Guid Id { get; init; }

    public string? Name { get; init; }

    public string? Url { get; init; }

    public string? Secret { get; init; }

    public string? EventTypes { get; init; }

    public bool? IsActive { get; init; }
}