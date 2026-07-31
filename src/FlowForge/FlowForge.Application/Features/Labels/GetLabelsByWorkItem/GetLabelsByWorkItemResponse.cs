namespace FlowForge.Application.Features.Labels.GetLabelsByWorkItem;

public sealed class GetLabelsByWorkItemResponse
{
    public Guid Id { get; init; }

    public Guid LabelId { get; init; }

    public string Name { get; init; } = string.Empty;

    public string Color { get; init; } = string.Empty;

    public string? Description { get; init; }

    public DateTime AssignedAt { get; init; }
}