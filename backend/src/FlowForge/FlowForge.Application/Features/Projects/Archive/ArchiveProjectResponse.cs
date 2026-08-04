namespace FlowForge.Application.Features.Projects.Archive;

public sealed class ArchiveProjectResponse
{
    public Guid Id { get; init; }

    public bool IsArchived { get; init; }
}