namespace FlowForge.Application.Features.Labels.Delete;

public sealed class DeleteLabelResponse
{
    public Guid Id { get; init; }

    public string Name { get; init; } = string.Empty;

    public bool IsDeleted { get; init; }

    public DateTime? DeletedAt { get; init; }
}