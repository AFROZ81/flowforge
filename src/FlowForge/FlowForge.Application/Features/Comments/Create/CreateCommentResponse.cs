namespace FlowForge.Application.Features.Comments.Create;

public sealed class CreateCommentResponse
{
    public Guid Id { get; init; }

    public Guid WorkItemId { get; init; }

    public Guid AuthorId { get; init; }

    public string Content { get; init; } = string.Empty;

    public bool IsEdited { get; init; }

    public DateTime CreatedAt { get; init; }
}