namespace FlowForge.Application.Features.WorkItems.Move;

public sealed class MoveWorkItemResponse
{
    public Guid Id { get; init; }

    public Guid ColumnId { get; init; }

    public long DisplayOrder { get; init; }
}