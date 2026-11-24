using FlowForge.Application.Common.Exceptions;
using FlowForge.Application.Features.Webhooks.UpdateWebhook;
using FlowForge.Application.Interfaces;
using FlowForge.Application.Services.Webhooks;
using FlowForge.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FlowForge.Application.Features.Webhooks.UpdateWebhook;

/// <summary>
/// Handles <see cref="UpdateWebhookCommand"/>.
/// </summary>
public sealed class UpdateWebhookCommandHandler : IRequestHandler<UpdateWebhookCommand, UpdateWebhookResponse>
{
    private readonly IApplicationDbContext _context;

    public UpdateWebhookCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<UpdateWebhookResponse> Handle(UpdateWebhookCommand request, CancellationToken cancellationToken)
    {
        var subscription = await _context.WebhookSubscriptions
            .FirstOrDefaultAsync(w => w.Id == request.Id && !w.IsDeleted, cancellationToken);

        if (subscription == null)
            throw new NotFoundException("Webhook subscription not found.");

        if (request.Name is not null)
            subscription.Name = request.Name;

        if (request.Url is not null)
            subscription.Url = request.Url;

        if (request.Secret is not null)
            subscription.Secret = request.Secret;

        if (request.EventTypes is not null)
            subscription.EventTypes = request.EventTypes;

        if (request.IsActive.HasValue)
            subscription.IsActive = request.IsActive.Value;

        await _context.SaveChangesAsync(cancellationToken);

        return new UpdateWebhookResponse
        {
            Id = subscription.Id,
            Name = subscription.Name,
            Url = subscription.Url,
            EventTypes = subscription.EventTypes,
            IsActive = subscription.IsActive,
        };
    }
}