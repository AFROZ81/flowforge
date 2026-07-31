namespace FlowForge.Application.Features.Labels.Remove;

public sealed class RemoveLabelResponse
{
    public Guid WorkItemId { get; init; }

    public Guid LabelId { get; init; }

    public bool IsDeleted { get; init; }

    public DateTime? DeletedAt { get; init; }
}