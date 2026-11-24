using FlowForge.Domain.Events;

namespace FlowForge.Domain.Events.Boards;

/// <summary>
/// Event raised when a board is archived.
/// </summary>
public sealed record BoardArchivedEvent : IDomainEvent
{
    public Guid BoardId { get; init; }
    public Guid OrganizationId { get; init; }
    public Guid ArchivedBy { get; init; }
    public DateTime OccurredAt { get; init; } = DateTime.UtcNow;
}