namespace FlowForge.Application.Features.WorkItems.Create;
using FlowForge.Domain.Common.Enums;

public sealed class CreateWorkItemResponse
{
    public Guid Id { get; init; }

    public Guid ColumnId { get; init; }

    public string Title { get; init; } = string.Empty;

    public WorkItemPriority Priority { get; init; }

    public WorkItemStatus Status { get; init; }

    public long DisplayOrder { get; init; }
}