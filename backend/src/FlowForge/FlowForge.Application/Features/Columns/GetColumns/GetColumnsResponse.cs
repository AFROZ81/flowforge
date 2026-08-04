namespace FlowForge.Application.Features.Columns.GetColumns;

public sealed class GetColumnsResponse
{
    public Guid Id { get; init; }

    public Guid BoardId { get; init; }

    public string Name { get; init; } = string.Empty;

    public string? Description { get; init; }

    public int DisplayOrder { get; init; }

    public bool IsArchived { get; init; }
}