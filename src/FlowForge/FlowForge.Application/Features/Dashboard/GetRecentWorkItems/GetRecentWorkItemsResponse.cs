namespace FlowForge.Application.Features.Dashboard.GetRecentWorkItems;

public sealed class GetRecentWorkItemsResponse
{
    public Guid WorkItemId { get; init; }

    public string Title { get; init; } = string.Empty;

    public string Status { get; init; } = string.Empty;

    public string Priority { get; init; } = string.Empty;

    public DateTime? DueDate { get; init; }

    public Guid ProjectId { get; init; }

    public string ProjectName { get; init; } = string.Empty;

    public string ProjectKey { get; init; } = string.Empty;

    public Guid BoardId { get; init; }

    public string BoardName { get; init; } = string.Empty;

    public Guid ColumnId { get; init; }

    public string ColumnName { get; init; } = string.Empty;

    public DateTime LastActivityAt { get; init; }
}