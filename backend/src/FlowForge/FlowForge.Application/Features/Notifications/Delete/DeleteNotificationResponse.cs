namespace FlowForge.Application.Features.Notifications.Delete;

public sealed class DeleteNotificationResponse
{
    public Guid Id { get; init; }

    public bool IsDeleted { get; init; }

    public DateTime? DeletedAt { get; init; }
}