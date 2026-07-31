using FlowForge.Domain.Enums;

namespace FlowForge.Application.Services.Notifications;

public interface INotificationService
{
    Task CreateAsync(Guid organizationId, Guid recipientId, NotificationType type, string title, string message, Guid? workItemId = null, CancellationToken cancellationToken = default);
}