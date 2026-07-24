namespace FlowForge.Application.Features.WorkItems.Restore;

public sealed class RestoreWorkItemResponse
{
    public Guid Id { get; init; }

    public bool IsArchived { get; init; }
}