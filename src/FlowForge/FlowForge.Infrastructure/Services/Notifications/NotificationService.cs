using FlowForge.Application.Interfaces;
using FlowForge.Application.Services.Notifications;
using FlowForge.Domain.Entities;
using FlowForge.Domain.Enums;

namespace FlowForge.Infrastructure.Services.Notifications;

public sealed class NotificationService : INotificationService
{
    private readonly IApplicationDbContext _context;

    public NotificationService(IApplicationDbContext context)
    {
        _context = context;
    }

    public Task CreateAsync(Guid organizationId, Guid recipientId, NotificationType type, string title, string message, Guid? workItemId = null, CancellationToken cancellationToken = default)
    {
        var notification = new Notification(organizationId, recipientId, type, title, message, workItemId);

        _context.Notifications.Add(notification);

        return Task.CompletedTask;
    }
}