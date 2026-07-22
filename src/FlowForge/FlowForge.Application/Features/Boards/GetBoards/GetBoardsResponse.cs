namespace FlowForge.Application.Features.Boards.GetBoards;

public sealed class GetBoardsResponse
{
    public Guid Id { get; init; }

    public string Name { get; init; } = string.Empty;

    public string? Description { get; init; }

    public bool IsArchived { get; init; }

    public DateTime CreatedAt { get; init; }
}