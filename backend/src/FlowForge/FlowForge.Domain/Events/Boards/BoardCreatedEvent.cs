using FlowForge.Domain.Events;

namespace FlowForge.Domain.Events.Boards;

/// <summary>
/// Event raised when a board is created.
/// </summary>
public sealed record BoardCreatedEvent : IDomainEvent
{
    public Guid BoardId { get; init; }
    public Guid ProjectId { get; init; }
    public Guid OrganizationId { get; init; }
    public string Name { get; init; } = string.Empty;
    public Guid CreatedBy { get; init; }
    public DateTime OccurredAt { get; init; } = DateTime.UtcNow;
}