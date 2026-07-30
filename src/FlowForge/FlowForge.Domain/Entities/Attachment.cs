using FlowForge.Domain.Common.Base;

namespace FlowForge.Domain.Entities;

public sealed class Attachment : EntityBase
{
    public Guid WorkItemId { get; private set; }

    public Guid UploadedById { get; private set; }

    public string FileName { get; private set; } = string.Empty;

    public string StoredFileName { get; private set; } = string.Empty;

    public string ContentType { get; private set; } = string.Empty;

    public long FileSize { get; private set; }

    public string StoragePath { get; private set; } = string.Empty;

    public WorkItem WorkItem { get; private set; } = default!;

    private Attachment()
    {
    }

    public Attachment(Guid workItemId, Guid uploadedById, string fileName, string storedFileName, string contentType, long fileSize, string storagePath)
    {
        WorkItemId = workItemId;
        UploadedById = uploadedById;
        FileName = fileName.Trim();
        StoredFileName = storedFileName.Trim();
        ContentType = contentType.Trim();
        FileSize = fileSize;
        StoragePath = storagePath.Trim();
    }

    public void Delete()
    {
        if (IsDeleted)
            return;

        IsDeleted = true;
        DeletedAt = DateTime.UtcNow;
    }
}