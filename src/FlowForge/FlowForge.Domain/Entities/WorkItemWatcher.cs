using FlowForge.Domain.Common.Base;

namespace FlowForge.Domain.Entities;

public sealed class WorkItemWatcher : EntityBase
{
    private WorkItemWatcher()
    {
    }

    public WorkItemWatcher(Guid workItemId, Guid userId)
    {
        WorkItemId = workItemId;
        UserId = userId;
    }

    public Guid WorkItemId { get; private set; }

    public Guid UserId { get; private set; }

    public WorkItem WorkItem { get; private set; } = default!;

    public void Delete()
    {
        if (IsDeleted)
            return;

        IsDeleted = true;
        DeletedAt = DateTime.UtcNow;
    }
}