
namespace FlowForge.Domain.Enums;

public enum WorkItemHistoryAction
{
    Created = 1,

    Assigned,

    StatusChanged,

    CommentAdded,

    AttachmentAdded,

    AttachmentRemoved,

    LabelAdded,

    LabelRemoved,

    ChecklistCompleted,

    ChecklistUncompleted,

    WatcherAdded,

    WatcherRemoved,

    ReminderUpdated,

    ReminderRemoved,

    Completed
}
