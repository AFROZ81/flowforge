using FlowForge.Domain.Events;

namespace FlowForge.Domain.Events.Projects;

/// <summary>
/// Event raised when a project is archived.
/// </summary>
public sealed record ProjectArchivedEvent : IDomainEvent
{
    public Guid ProjectId { get; init; }
    public Guid OrganizationId { get; init; }
    public Guid ArchivedBy { get; init; }
    public DateTime OccurredAt { get; init; } = DateTime.UtcNow;
}