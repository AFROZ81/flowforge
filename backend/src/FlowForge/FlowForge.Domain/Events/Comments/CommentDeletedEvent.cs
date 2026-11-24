using FlowForge.Domain.Events;

namespace FlowForge.Domain.Events.Comments;

/// <summary>
/// Event raised when a comment is deleted.
/// </summary>
public sealed record CommentDeletedEvent : IDomainEvent
{
    public Guid CommentId { get; init; }
    public Guid WorkItemId { get; init; }
    public Guid OrganizationId { get; init; }
    public Guid DeletedBy { get; init; }
    public DateTime OccurredAt { get; init; } = DateTime.UtcNow;
}