using FlowForge.Domain.Enums;
using FlowForge.Domain.Entities;

namespace FlowForge.Application.Services.Notifications;

public interface INotificationService
{
    Task<Notification> CreateAsync(Guid organizationId, Guid recipientId, NotificationType type, string title, string message, Guid? workItemId = null, CancellationToken cancellationToken = default);
}