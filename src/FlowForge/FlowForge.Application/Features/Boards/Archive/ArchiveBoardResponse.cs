namespace FlowForge.Application.Features.Boards.Archive;

public sealed class ArchiveBoardResponse
{
    public Guid Id { get; init; }

    public bool IsArchived { get; init; }
}