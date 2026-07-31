namespace FlowForge.Application.Features.Notifications.MarkAsRead;

public sealed class MarkNotificationAsReadResponse
{
    public Guid Id { get; init; }

    public bool IsRead { get; init; }

    public DateTime? ReadAt { get; init; }
}