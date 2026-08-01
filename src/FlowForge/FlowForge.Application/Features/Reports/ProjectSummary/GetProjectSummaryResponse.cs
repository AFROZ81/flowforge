namespace FlowForge.Application.Features.Reports.ProjectSummary;

public sealed class GetProjectSummaryResponse
{
    public Guid ProjectId { get; init; }

    public string ProjectName { get; init; } = string.Empty;

    public int Total { get; init; }

    public int Active { get; init; }

    public int Completed { get; init; }

    public int Blocked { get; init; }

    public double CompletionPercentage { get; init; }
}