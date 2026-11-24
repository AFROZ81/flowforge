using MediatR;

namespace FlowForge.Application.Features.Webhooks.CreateWebhook;

/// <summary>
/// Command to create a webhook subscription.
/// </summary>
public sealed class CreateWebhookCommand : IRequest<CreateWebhookResponse>
{
    public string Name { get; init; } = string.Empty;

    public string Url { get; init; } = string.Empty;

    public string? Secret { get; init; }

    public string EventTypes { get; init; } = string.Empty;

    public Guid OrganizationId { get; init; }
}