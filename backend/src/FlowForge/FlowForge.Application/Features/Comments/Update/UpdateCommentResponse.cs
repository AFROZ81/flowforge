namespace FlowForge.Application.Features.Comments.Update;

public sealed class UpdateCommentResponse
{
    public Guid Id { get; init; }

    public Guid WorkItemId { get; init; }

    public Guid AuthorId { get; init; }

    public string Content { get; init; } = string.Empty;

    public bool IsEdited { get; init; }

    public DateTime? EditedAt { get; init; }

    public DateTime? UpdatedAt { get; init; }
}