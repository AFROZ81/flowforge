using MediatR;

namespace FlowForge.Application.Features.Webhooks.TestWebhook;

/// <summary>
/// Command to test a webhook subscription.
/// </summary>
public sealed class TestWebhookCommand : IRequest<TestWebhookResponse>
{
    public Guid Id { get; init; }
}