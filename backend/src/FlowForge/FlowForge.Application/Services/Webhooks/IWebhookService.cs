using FlowForge.Application.Features.Webhooks.CreateWebhook;
using FlowForge.Application.Features.Webhooks.GetWebhooks;
using FlowForge.Application.Features.Webhooks.UpdateWebhook;
using FlowForge.Application.Features.Webhooks.DeleteWebhook;
using FlowForge.Application.Features.Webhooks.TestWebhook;

namespace FlowForge.Application.Services.Webhooks;

/// <summary>
/// Defines operations for managing webhook subscriptions.
/// </summary>
public interface IWebhookService
{
    Task<CreateWebhookResponse> CreateAsync(CreateWebhookRequest request, CancellationToken cancellationToken = default);

    Task<List<GetWebhooksResponse>> GetAsync(Guid organizationId, CancellationToken cancellationToken = default);

    Task<UpdateWebhookResponse> UpdateAsync(Guid id, UpdateWebhookRequest request, CancellationToken cancellationToken = default);

    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);

    Task<TestWebhookResponse> TestAsync(Guid id, CancellationToken cancellationToken = default);
}