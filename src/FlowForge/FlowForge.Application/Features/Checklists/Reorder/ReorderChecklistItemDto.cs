namespace FlowForge.Application.Features.Checklists.Reorder;

public sealed class ReorderChecklistItemDto
{
    public Guid ChecklistItemId { get; init; }

    public int Order { get; init; }
}