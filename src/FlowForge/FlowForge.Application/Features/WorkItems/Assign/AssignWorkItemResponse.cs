namespace FlowForge.Application.Features.WorkItems.Assign;

public sealed class AssignWorkItemResponse
{
    public Guid WorkItemId { get; init; }

    public Guid AssigneeId { get; init; }

    public string AssigneeName { get; init; } = string.Empty;
}