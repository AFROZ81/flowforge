using FlowForge.Domain.Common.Base;

namespace FlowForge.Domain.Entities;

public sealed class Comment : EntityBase
{
    public Guid WorkItemId { get; private set; }

    public Guid AuthorId { get; private set; }

    public string Content { get; private set; } = string.Empty;

    public bool IsEdited { get; private set; }

    public DateTime? EditedAt { get; private set; }

    public WorkItem WorkItem { get; private set; } = default!;

    private Comment()
    {
    }

    public Comment(
        Guid workItemId,
        Guid authorId,
        string content)
    {
        WorkItemId = workItemId;
        AuthorId = authorId;
        Content = content.Trim();
        IsEdited = false;
    }

    public void Edit(string content)
    {
        var trimmedContent = content.Trim();

        if (Content == trimmedContent)
            return;

        Content = trimmedContent;
        IsEdited = true;
        EditedAt = DateTime.UtcNow;
    }

    public void Delete()
    {
        if (IsDeleted)
            return;

        IsDeleted = true;
        DeletedAt = DateTime.UtcNow;
    }
}