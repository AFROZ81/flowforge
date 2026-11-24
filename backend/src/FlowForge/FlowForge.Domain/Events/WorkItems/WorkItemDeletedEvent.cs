using FlowForge.Domain.Events;

namespace FlowForge.Domain.Events.WorkItems;

/// <summary>
/// Event raised when a work item is deleted (soft delete/archive).
/// </summary>
public sealed record WorkItemDeletedEvent : IDomainEvent
{
    public Guid WorkItemId { get; init; }
    public Guid OrganizationId { get; init; }
    public Guid DeletedBy { get; init; }
    public DateTime OccurredAt { get; init; } = DateTime.UtcNow;
}