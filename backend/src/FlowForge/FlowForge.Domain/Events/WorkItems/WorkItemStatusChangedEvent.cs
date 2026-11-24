using FlowForge.Domain.Events;

namespace FlowForge.Domain.Events.WorkItems;

/// <summary>
/// Event raised when a work item status changes.
/// </summary>
public sealed record WorkItemStatusChangedEvent : IDomainEvent
{
    public Guid WorkItemId { get; init; }
    public Guid OrganizationId { get; init; }
    public string OldStatus { get; init; } = string.Empty;
    public string NewStatus { get; init; } = string.Empty;
    public Guid ChangedBy { get; init; }
    public DateTime OccurredAt { get; init; } = DateTime.UtcNow;
}