using FlowForge.Domain.Common.Base;

namespace FlowForge.Domain.Entities;

public sealed class WorkItemLabel : EntityBase
{
    public Guid WorkItemId { get; private set; }

    public Guid LabelId { get; private set; }

    public WorkItem WorkItem { get; private set; } = default!;

    public Label Label { get; private set; } = default!;

    private WorkItemLabel()
    {
    }

    public WorkItemLabel(Guid workItemId, Guid labelId)
    {
        WorkItemId = workItemId;
        LabelId = labelId;
    }

    public void Remove()
    {
        if (IsDeleted)
            return;

        IsDeleted = true;
        DeletedAt = DateTime.UtcNow;
    }

    public void Restore()
    {
        if (!IsDeleted)
            return;

        IsDeleted = false;
        DeletedAt = null;
    }
}