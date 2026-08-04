namespace FlowForge.Application.Features.Dashboard.GetOverview;

public sealed class GetDashboardOverviewResponse
{
    public int TotalProjects { get; init; }

    public int TotalBoards { get; init; }

    public int TotalWorkItems { get; init; }

    public int ActiveWorkItems { get; init; }

    public int CompletedWorkItems { get; init; }

    public int BlockedWorkItems { get; init; }

    public int OverdueWorkItems { get; init; }

    public decimal CompletionPercentage { get; init; }
}