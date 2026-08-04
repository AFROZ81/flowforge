namespace FlowForge.Application.Features.Columns.Restore;

public sealed class RestoreColumnResponse
{
    public Guid Id { get; init; }

    public bool IsArchived { get; init; }
}