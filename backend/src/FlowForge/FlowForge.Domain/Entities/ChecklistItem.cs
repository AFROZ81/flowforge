using FlowForge.Domain.Common.Base;

namespace FlowForge.Domain.Entities;

public sealed class ChecklistItem : EntityBase
{
    private ChecklistItem()
    {
    }

    public ChecklistItem(
        Guid workItemId,
        string title,
        int order)
    {
        WorkItemId = workItemId;
        Title = title;
        Order = order;
        IsCompleted = false;
    }

    public Guid WorkItemId { get; private set; }

    public string Title { get; private set; } = string.Empty;

    public int Order { get; private set; }

    public bool IsCompleted { get; private set; }

    public DateTime? CompletedAt { get; private set; }

    public Guid? CompletedBy { get; private set; }

    public WorkItem WorkItem { get; private set; } = null!;

    public void Rename(string title)
    {
        Title = title.Trim();
    }

    public void Reorder(int order)
    {
        Order = order;
    }

    public void Complete(Guid userId)
    {
        if (IsCompleted)
            return;

        IsCompleted = true;
        CompletedAt = DateTime.UtcNow;
        CompletedBy = userId;
    }

    public void Uncomplete()
    {
        if (!IsCompleted)
            return;

        IsCompleted = false;
        CompletedAt = null;
        CompletedBy = null;
    }

    public void Delete()
    {
        if (IsDeleted)
            return;

        IsDeleted = true;
        DeletedAt = DateTime.UtcNow;
    }
}