namespace FlowForge.Application.Features.Attachments.GetAttachmentById;

public sealed class GetAttachmentByIdResponse
{
    public Guid Id { get; init; }

    public Guid WorkItemId { get; init; }

    public Guid UploadedById { get; init; }

    public string FileName { get; init; } = string.Empty;

    public string ContentType { get; init; } = string.Empty;

    public long FileSize { get; init; }

    public DateTime CreatedAt { get; init; }
}