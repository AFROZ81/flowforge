namespace FlowForge.Application.Features.Attachments.GetAttachmentsByWorkItem;

public sealed class GetAttachmentsByWorkItemResponse
{
    public Guid Id { get; init; }

    public Guid WorkItemId { get; init; }

    public Guid UploadedById { get; init; }

    public string FileName { get; init; } = string.Empty;

    public string ContentType { get; init; } = string.Empty;

    public long FileSize { get; init; }

    public DateTime CreatedAt { get; init; }
}