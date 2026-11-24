using FlowForge.Application.Common.Exceptions;
using FlowForge.Application.Features.Webhooks.CreateWebhook;
using FlowForge.Application.Interfaces;
using FlowForge.Application.Services.Webhooks;
using FlowForge.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FlowForge.Application.Features.Webhooks.CreateWebhook;

/// <summary>
/// Handles <see cref="CreateWebhookCommand"/>.
/// </summary>
public sealed class CreateWebhookCommandHandler : IRequestHandler<CreateWebhookCommand, CreateWebhookResponse>
{
    private readonly IApplicationDbContext _context;
    private readonly IWebhookService _webhookService;

    public CreateWebhookCommandHandler(
        IApplicationDbContext context,
        IWebhookService webhookService)
    {
        _context = context;
        _webhookService = webhookService;
    }

    public async Task<CreateWebhookResponse> Handle(CreateWebhookCommand request, CancellationToken cancellationToken)
    {
        var subscription = new WebhookSubscription
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Url = request.Url,
            Secret = request.Secret,
            EventTypes = request.EventTypes,
            OrganizationId = request.OrganizationId,
            IsActive = true,
        };

        _context.WebhookSubscriptions.Add(subscription);
        await _context.SaveChangesAsync(cancellationToken);

        return new CreateWebhookResponse
        {
            Id = subscription.Id,
            Name = subscription.Name,
            Url = subscription.Url,
            EventTypes = subscription.EventTypes,
            IsActive = subscription.IsActive,
        };
    }
}