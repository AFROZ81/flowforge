namespace FlowForge.Application.Features.Notifications.MarkAsUnread;

public sealed class MarkNotificationAsUnreadResponse
{
    public Guid Id { get; init; }

    public bool IsRead { get; init; }

    public DateTime? ReadAt { get; init; }
}