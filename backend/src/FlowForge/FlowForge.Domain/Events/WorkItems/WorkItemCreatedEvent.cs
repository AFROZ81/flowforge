using FlowForge.Domain.Events;

namespace FlowForge.Domain.Events.WorkItems;

/// <summary>
/// Event raised when a work item is created.
/// </summary>
public sealed record WorkItemCreatedEvent : IDomainEvent
{
    public Guid WorkItemId { get; init; }
    public Guid OrganizationId { get; init; }
    public Guid ProjectId { get; init; }
    public Guid BoardId { get; init; }
    public string Title { get; init; } = string.Empty;
    public Guid CreatedBy { get; init; }
    public DateTime OccurredAt { get; init; } = DateTime.UtcNow;
}