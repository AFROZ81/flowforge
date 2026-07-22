namespace FlowForge.Application.Features.Boards.Create;

public sealed class CreateBoardResponse
{
    public Guid Id { get; init; }

    public string Name { get; init; } = string.Empty;

    public Guid ProjectId { get; init; }
}