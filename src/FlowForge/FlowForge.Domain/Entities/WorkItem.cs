using FlowForge.Domain.Common.Base;
using FlowForge.Domain.Common.Enums;

namespace FlowForge.Domain.Entities;

public sealed class WorkItem : EntityBase
{
    public Guid ColumnId { get; private set; }

    public string Title { get; private set; } = string.Empty;

    public string? Description { get; private set; }

    public WorkItemPriority Priority { get; private set; }

    public WorkItemStatus Status { get; private set; }

    public long DisplayOrder { get; private set; }

    public DateTime? DueDate { get; private set; }

    public bool IsArchived { get; private set; }

    public Column Column { get; private set; } = default!;

    private WorkItem()
    {
    }

    public WorkItem(Guid columnId, string title, string? description, WorkItemPriority priority, DateTime? dueDate, long displayOrder)
    {
        ColumnId = columnId;
        Title = title.Trim();
        Description = description?.Trim();
        Priority = priority;
        Status = WorkItemStatus.Active;
        DueDate = dueDate;
        DisplayOrder = displayOrder;
    }

    public void Rename(string title)
    {
        Title = title.Trim();
    }

    public void MoveToColumn(Guid columnId, long displayOrder)
    {
        ColumnId = columnId;
        DisplayOrder = displayOrder;
    }

    public void Reorder(long displayOrder)
    {
        DisplayOrder = displayOrder;
    }

    public void Edit(string? description, WorkItemPriority priority, DateTime? dueDate)
    {
        Description = description?.Trim();
        Priority = priority;
        DueDate = dueDate;
    }

    public void MarkCompleted()
    {
        if (Status == WorkItemStatus.Completed)
            return;

        Status = WorkItemStatus.Completed;
    }

    public void MarkBlocked()
    {
        if (Status == WorkItemStatus.Blocked)
            return;

        Status = WorkItemStatus.Blocked;
    }

    public void Activate()
    {
        if (Status == WorkItemStatus.Active)
            return;

        Status = WorkItemStatus.Active;
    }

    public void Archive()
    {
        if (!IsArchived)
        {
            IsArchived = true;
        }
    }

    public void Restore()
    {
        if (IsArchived)
        {
            IsArchived = false;
        }
    }
}