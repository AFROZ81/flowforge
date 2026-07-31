namespace FlowForge.Application.Features.WorkItems.Unassign;

public sealed class UnassignWorkItemResponse
{
    public Guid WorkItemId { get; init; }

    public Guid? AssigneeId { get; init; }
}