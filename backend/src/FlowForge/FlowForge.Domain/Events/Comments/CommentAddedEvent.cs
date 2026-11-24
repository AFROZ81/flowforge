using FlowForge.Domain.Events;

namespace FlowForge.Domain.Events.Comments;

/// <summary>
/// Event raised when a comment is added to a work item.
/// </summary>
public sealed record CommentAddedEvent : IDomainEvent
{
    public Guid CommentId { get; init; }
    public Guid WorkItemId { get; init; }
    public Guid OrganizationId { get; init; }
    public Guid AuthorId { get; init; }
    public string Content { get; init; } = string.Empty;
    public DateTime OccurredAt { get; init; } = DateTime.UtcNow;
}