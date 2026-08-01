namespace FlowForge.Application.Features.Checklists.Uncomplete;

public sealed class UncompleteChecklistItemResponse
{
    public Guid Id { get; init; }

    public bool IsCompleted { get; init; }
}