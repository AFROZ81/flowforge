using FlowForge.Application.Common.Exceptions;
using FlowForge.Application.Interfaces;
using FlowForge.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace FlowForge.Application.Features.Notifications;

public sealed class NotificationRules
{
    private readonly IApplicationDbContext _context;

    public NotificationRules(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Notification> GetByIdAsync(Guid notificationId, Guid organizationId, Guid recipientId, CancellationToken cancellationToken)
    {
        var notification = await _context.Notifications
            .FirstOrDefaultAsync(
                x => x.Id == notificationId &&
                     x.OrganizationId == organizationId &&
                     x.RecipientId == recipientId &&
                     !x.IsDeleted,
                cancellationToken);

        if (notification is null)
            throw new NotFoundException("Notification not found.");

        return notification;
    }
}