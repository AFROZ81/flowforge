using FlowForge.Domain.Events;

namespace FlowForge.Domain.Events.WorkItems;

/// <summary>
/// Event raised when a work item is moved between columns.
/// </summary>
public sealed record WorkItemMovedEvent : IDomainEvent
{
    public Guid WorkItemId { get; init; }
    public Guid OrganizationId { get; init; }
    public Guid FromColumnId { get; init; }
    public Guid ToColumnId { get; init; }
    public int NewDisplayOrder { get; init; }
    public Guid MovedBy { get; init; }
    public DateTime OccurredAt { get; init; } = DateTime.UtcNow;
}