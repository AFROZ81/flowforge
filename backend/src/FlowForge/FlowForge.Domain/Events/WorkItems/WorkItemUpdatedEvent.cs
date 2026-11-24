using FlowForge.Domain.Events;

namespace FlowForge.Domain.Events.WorkItems;

/// <summary>
/// Event raised when a work item is updated.
/// </summary>
public sealed record WorkItemUpdatedEvent : IDomainEvent
{
    public Guid WorkItemId { get; init; }
    public Guid OrganizationId { get; init; }
    public Guid UpdatedBy { get; init; }
    public string? OldTitle { get; init; }
    public string? NewTitle { get; init; }
    public string? OldDescription { get; init; }
    public string? NewDescription { get; init; }
    public int? OldPriority { get; init; }
    public int? NewPriority { get; init; }
    public DateTime? OldDueDate { get; init; }
    public DateTime? NewDueDate { get; init; }
    public DateTime OccurredAt { get; init; } = DateTime.UtcNow;
}