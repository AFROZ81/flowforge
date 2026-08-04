namespace FlowForge.Application.Features.Reminders.Overdue;

public sealed class GetOverdueWorkItemsResponse
{
    public Guid WorkItemId { get; init; }

    public string Title { get; init; } = string.Empty;

    public DateTime? DueDate { get; init; }
}