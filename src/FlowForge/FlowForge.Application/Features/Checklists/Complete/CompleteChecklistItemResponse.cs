namespace FlowForge.Application.Features.Checklists.Complete;

public sealed class CompleteChecklistItemResponse
{
    public Guid Id { get; init; }

    public bool IsCompleted { get; init; }

    public DateTime? CompletedAt { get; init; }

    public Guid? CompletedBy { get; init; }
}