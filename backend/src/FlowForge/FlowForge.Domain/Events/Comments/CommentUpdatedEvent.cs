using FlowForge.Domain.Events;

namespace FlowForge.Domain.Events.Comments;

/// <summary>
/// Event raised when a comment is updated.
/// </summary>
public sealed record CommentUpdatedEvent : IDomainEvent
{
    public Guid CommentId { get; init; }
    public Guid WorkItemId { get; init; }
    public Guid OrganizationId { get; init; }
    public Guid UpdatedBy { get; init; }
    public string OldContent { get; init; } = string.Empty;
    public string NewContent { get; init; } = string.Empty;
    public DateTime OccurredAt { get; init; } = DateTime.UtcNow;
}