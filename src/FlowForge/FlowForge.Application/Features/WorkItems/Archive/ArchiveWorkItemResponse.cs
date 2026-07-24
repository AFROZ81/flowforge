namespace FlowForge.Application.Features.WorkItems.Archive;

public sealed class ArchiveWorkItemResponse
{
    public Guid Id { get; init; }

    public bool IsArchived { get; init; }
}