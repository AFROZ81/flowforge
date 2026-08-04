using FlowForge.Domain.Common.Base;
using FlowForge.Domain.Enums;

namespace FlowForge.Domain.Entities;

public sealed class WorkItemHistory : EntityBase
{
    private WorkItemHistory()
    {
    }

    public WorkItemHistory(Guid workItemId, Guid userId, WorkItemHistoryAction action, string description)
    {
        WorkItemId = workItemId;
        UserId = userId;
        Action = action;
        Description = description;
    }

    public Guid WorkItemId { get; private set; }

    public Guid UserId { get; private set; }

    public WorkItemHistoryAction Action { get; private set; }

    public string Description { get; private set; } = string.Empty;

    public WorkItem WorkItem { get; private set; } = default!;

    public void Delete()
    {
        if (IsDeleted)
            return;

        IsDeleted = true;
        DeletedAt = DateTime.UtcNow;
    }
}