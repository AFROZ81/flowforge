namespace FlowForge.Application.Features.WorkItems.Rename;

public sealed class RenameWorkItemResponse
{
    public Guid Id { get; init; }

    public string Title { get; init; } = string.Empty;
}