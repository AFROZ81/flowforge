namespace FlowForge.Application.Features.Checklists.Update;

public sealed class UpdateChecklistItemResponse
{
    public Guid Id { get; init; }

    public string Title { get; init; } = string.Empty;
}