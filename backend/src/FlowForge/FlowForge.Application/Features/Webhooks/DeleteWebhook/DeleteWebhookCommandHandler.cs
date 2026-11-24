using FlowForge.Application.Common.Exceptions;
using FlowForge.Application.Features.Webhooks.DeleteWebhook;
using FlowForge.Application.Interfaces;
using FlowForge.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FlowForge.Application.Features.Webhooks.DeleteWebhook;

/// <summary>
/// Handles <see cref="DeleteWebhookCommand"/>.
/// </summary>
public sealed class DeleteWebhookCommandHandler : IRequestHandler<DeleteWebhookCommand>
{
    private readonly IApplicationDbContext _context;

    public DeleteWebhookCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task Handle(DeleteWebhookCommand request, CancellationToken cancellationToken)
    {
        var subscription = await _context.WebhookSubscriptions
            .FirstOrDefaultAsync(w => w.Id == request.Id && !w.IsDeleted, cancellationToken);

        if (subscription == null)
            throw new NotFoundException("Webhook subscription not found.");

        subscription.IsDeleted = true;
        await _context.SaveChangesAsync(cancellationToken);
    }
}