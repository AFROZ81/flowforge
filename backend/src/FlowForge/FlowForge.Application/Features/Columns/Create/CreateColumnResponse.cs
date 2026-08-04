namespace FlowForge.Application.Features.Columns.Create;

public sealed class CreateColumnResponse
{
    public Guid Id { get; init; }

    public Guid BoardId { get; init; }

    public string Name { get; init; } = string.Empty;

    public int DisplayOrder { get; init; }
}