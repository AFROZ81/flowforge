namespace FlowForge.Application.Features.Checklists.Get;

public sealed class GetChecklistResponse
{
    public Guid Id { get; init; }

    public string Title { get; init; } = string.Empty;

    public int Order { get; init; }

    public bool IsCompleted { get; init; }

    public DateTime? CompletedAt { get; init; }

    public Guid? CompletedBy { get; init; }
}