namespace FlowForge.Application.Features.Boards.Delete;

public sealed class DeleteBoardResponse
{
    public Guid Id { get; init; }

    public DateTime DeletedAt { get; init; }
}
