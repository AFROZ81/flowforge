namespace FlowForge.Application.Features.Boards.Restore;

public sealed class RestoreBoardResponse
{
    public Guid Id { get; init; }

    public bool IsArchived { get; init; }
}