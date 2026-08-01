namespace FlowForge.Application.Features.Reports.AssigneeSummary;

public sealed class GetAssigneeSummaryResponse
{
    public Guid UserId { get; init; }

    public string FullName { get; init; } = string.Empty;

    public string Email { get; init; } = string.Empty;

    public int Assigned { get; init; }

    public int Active { get; init; }

    public int Completed { get; init; }

    public int Blocked { get; init; }

    public int Overdue { get; init; }
}