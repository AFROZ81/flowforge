namespace FlowForge.Application.Features.Comments.Delete;

public sealed class DeleteCommentResponse
{
    public Guid Id { get; init; }

    public Guid WorkItemId { get; init; }

    public bool IsDeleted { get; init; }

    public DateTime? DeletedAt { get; init; }
}