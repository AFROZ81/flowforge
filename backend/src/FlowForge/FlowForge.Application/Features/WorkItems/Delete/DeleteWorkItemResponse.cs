namespace FlowForge.Application.Features.WorkItems.Delete;

public sealed class DeleteWorkItemResponse
{
    public Guid Id { get; init; }

    public DateTime DeletedAt { get; init; }
}
