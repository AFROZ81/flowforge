using FlowForge.Domain.Events;

namespace FlowForge.Domain.Events.Projects;

/// <summary>
/// Event raised when a project is created.
/// </summary>
public sealed record ProjectCreatedEvent : IDomainEvent
{
    public Guid ProjectId { get; init; }
    public Guid OrganizationId { get; init; }
    public string Name { get; init; } = string.Empty;
    public Guid CreatedBy { get; init; }
    public DateTime OccurredAt { get; init; } = DateTime.UtcNow;
}