namespace FlowForge.Application.Features.Checklists.Progress;

public sealed class GetChecklistProgressResponse
{
    public int TotalItems { get; init; }

    public int CompletedItems { get; init; }

    public int ProgressPercentage { get; init; }
}