namespace FlowForge.Application.Features.Checklists.Create;

public sealed class CreateChecklistItemResponse
{
    public Guid Id { get; init; }

    public Guid WorkItemId { get; init; }

    public string Title { get; init; } = string.Empty;

    public int Order { get; init; }

    public bool IsCompleted { get; init; }

    public DateTime CreatedAt { get; init; }
}