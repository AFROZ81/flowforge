namespace FlowForge.Application.Features.Search.WorkItems;

public sealed class SearchWorkItemsResponse
{
    public Guid Id { get; init; }

    public string Title { get; init; } = string.Empty;

    public Guid ProjectId { get; init; }

    public string ProjectName { get; init; } = string.Empty;

    public Guid BoardId { get; init; }

    public string BoardName { get; init; } = string.Empty;

    public Guid ColumnId { get; init; }

    public string ColumnName { get; init; } = string.Empty;

    public Guid? AssigneeId { get; init; }

    public bool IsArchived { get; init; }

    public int CommentCount { get; init; }

    public int AttachmentCount { get; init; }

    public int ChecklistCount { get; init; }

    public int CompletedChecklistCount { get; init; }

    public int WatcherCount { get; init; }

    public DateTime CreatedAt { get; init; }
}