namespace FlowForge.Application.Features.Boards.Update;

public sealed class UpdateBoardResponse
{
    public Guid Id { get; init; }

    public string Name { get; init; } = string.Empty;

    public string? Description { get; init; }
}