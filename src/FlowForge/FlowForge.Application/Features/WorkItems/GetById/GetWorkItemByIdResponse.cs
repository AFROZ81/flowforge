using FlowForge.Domain.Common.Enums;

namespace FlowForge.Application.Features.WorkItems.GetById;

public sealed class GetWorkItemByIdResponse
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