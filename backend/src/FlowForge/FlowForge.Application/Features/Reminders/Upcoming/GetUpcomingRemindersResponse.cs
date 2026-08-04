namespace FlowForge.Application.Features.Reminders.Upcoming;

public sealed class GetUpcomingRemindersResponse
{
    public Guid WorkItemId { get; init; }

    public string Title { get; init; } = string.Empty;

    public DateTime? DueDate { get; init; }

    public DateTime? ReminderDate { get; init; }
}