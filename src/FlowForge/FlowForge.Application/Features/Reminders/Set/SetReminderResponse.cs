namespace FlowForge.Application.Features.Reminders.Set;

public sealed class SetReminderResponse
{
    public Guid WorkItemId { get; init; }

    public DateTime? DueDate { get; init; }

    public DateTime? ReminderDate { get; init; }
}