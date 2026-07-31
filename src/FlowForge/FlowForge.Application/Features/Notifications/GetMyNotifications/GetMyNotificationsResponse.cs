namespace FlowForge.Application.Features.Notifications.GetMyNotifications;

public sealed class GetMyNotificationsResponse
{
    public Guid Id { get; init; }

    public string Type { get; init; } = string.Empty;

    public string Title { get; init; } = string.Empty;

    public string Message { get; init; } = string.Empty;

    public Guid? WorkItemId { get; init; }

    public bool IsRead { get; init; }

    public DateTime? ReadAt { get; init; }

    public DateTime CreatedAt { get; init; }
}