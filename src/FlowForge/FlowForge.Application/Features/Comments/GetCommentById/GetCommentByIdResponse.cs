namespace FlowForge.Application.Features.Comments.GetCommentById;

public sealed class GetCommentByIdResponse
{
    public Guid Id { get; init; }

    public Guid WorkItemId { get; init; }

    public Guid AuthorId { get; init; }

    public string Content { get; init; } = string.Empty;
}