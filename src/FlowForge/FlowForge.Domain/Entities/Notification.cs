using FlowForge.Domain.Common.Base;
using FlowForge.Domain.Enums;

namespace FlowForge.Domain.Entities;

public sealed class Notification : EntityBase
{
    public Guid OrganizationId { get; private set; }

    public Guid RecipientId { get; private set; }

    public NotificationType Type { get; private set; }

    public string Title { get; private set; } = string.Empty;

    public string Message { get; private set; } = string.Empty;

    public Guid? WorkItemId { get; private set; }

    public bool IsRead { get; private set; }

    public DateTime? ReadAt { get; private set; }

    public Organization Organization { get; private set; } = default!;

    public WorkItem? WorkItem { get; private set; }


    private Notification()
    {
    }

    public Notification(Guid organizationId, Guid recipientId, NotificationType type, string title, string message, Guid? workItemId = null)
    {
        OrganizationId = organizationId;
        RecipientId = recipientId;
        Type = type;
        Title = title.Trim();
        Message = message.Trim();
        WorkItemId = workItemId;

        IsRead = false;
        ReadAt = null;
    }

    public void MarkAsRead()
    {
        if (IsRead)
            return;

        IsRead = true;
        ReadAt = DateTime.UtcNow;
    }

    public void MarkAsUnread()
    {
        if (!IsRead)
            return;

        IsRead = false;
        ReadAt = null;
    }

    public void Delete()
    {
        if (IsDeleted)
            return;

        IsDeleted = true;
        DeletedAt = DateTime.UtcNow;
    }
}