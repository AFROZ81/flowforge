namespace FlowForge.Application.Features.Columns.Update;

public sealed class UpdateColumnResponse
{
    public Guid Id { get; init; }

    public Guid BoardId { get; init; }

    public string Name { get; init; } = string.Empty;

    public string? Description { get; init; }

    public int DisplayOrder { get; init; }
}