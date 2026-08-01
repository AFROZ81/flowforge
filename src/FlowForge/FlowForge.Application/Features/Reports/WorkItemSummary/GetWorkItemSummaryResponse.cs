namespace FlowForge.Application.Features.Reports.WorkItemSummary;

public sealed class GetWorkItemSummaryResponse
{
    public int Total { get; init; }

    public int Active { get; init; }

    public int Blocked { get; init; }

    public int Completed { get; init; }

    public int Archived { get; init; }

    public int Assigned { get; init; }

    public int Unassigned { get; init; }

    public int Overdue { get; init; }
}