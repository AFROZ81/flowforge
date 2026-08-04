namespace FlowForge.Application.Features.Labels.Assign;

public sealed class AssignLabelResponse
{
    public Guid Id { get; init; }

    public Guid WorkItemId { get; init; }

    public Guid LabelId { get; init; }

    public string LabelName { get; init; } = string.Empty;

    public string Color { get; init; } = string.Empty;

    public DateTime CreatedAt { get; init; }
}