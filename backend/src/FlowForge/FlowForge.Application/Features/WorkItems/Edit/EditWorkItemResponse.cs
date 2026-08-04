using FlowForge.Domain.Common.Enums;

namespace FlowForge.Application.Features.WorkItems.Edit;

public sealed class EditWorkItemResponse
{
    public Guid Id { get; init; }

    public string? Description { get; init; }

    public WorkItemPriority Priority { get; init; }

    public DateTime? DueDate { get; init; }
}