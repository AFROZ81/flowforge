namespace FlowForge.Domain.Events;

/// <summary>
/// Base interface for all domain events.
/// </summary>
public interface IDomainEvent
{
    /// <summary>
    /// UTC timestamp when the event occurred.
    /// </summary>
    DateTime OccurredAt { get; }

    /// <summary>
    /// The organization ID associated with the event.
    /// </summary>
    Guid OrganizationId { get; }
}