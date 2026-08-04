namespace FlowForge.Application.Features.Comments.GetCommentsByWorkItem;

public sealed class GetCommentsByWorkItemResponse
{
    public Guid Id { get; init; }

    public Guid WorkItemId { get; init; }

    public Guid AuthorId { get; init; }

    public string Content { get; init; } = string.Empty;
}