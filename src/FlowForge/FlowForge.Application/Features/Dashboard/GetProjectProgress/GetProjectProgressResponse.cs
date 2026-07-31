namespace FlowForge.Application.Features.Dashboard.GetProjectProgress;

public sealed class GetProjectProgressResponse
{
    public Guid ProjectId { get; init; }

    public string ProjectName { get; init; } = string.Empty;

    public string ProjectKey { get; init; } = string.Empty;

    public string Color { get; init; } = string.Empty;

    public int TotalWorkItems { get; init; }

    public int ActiveWorkItems { get; init; }

    public int CompletedWorkItems { get; init; }

    public int BlockedWorkItems { get; init; }

    public int OverdueWorkItems { get; init; }

    public decimal CompletionPercentage { get; init; }
}