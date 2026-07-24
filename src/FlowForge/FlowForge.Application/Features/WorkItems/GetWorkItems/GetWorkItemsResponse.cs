using FlowForge.Domain.Common.Enums;

namespace FlowForge.Application.Features.WorkItems.GetWorkItems;

public sealed class GetWorkItemsResponse
{
    public Guid Id { get; init; }

    public Guid ColumnId { get; init; }

    public string Title { get; init; } = string.Empty;

    public string? Description { get; init; }

    public WorkItemPriority Priority { get; init; }

    public WorkItemStatus Status { get; init; }

    public long DisplayOrder { get; init; }

    public DateTime? DueDate { get; init; }

    public bool IsArchived { get; init; }
}