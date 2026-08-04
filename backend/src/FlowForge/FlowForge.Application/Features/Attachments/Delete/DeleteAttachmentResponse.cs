namespace FlowForge.Application.Features.Attachments.Delete;

public sealed class DeleteAttachmentResponse
{
    public Guid Id { get; init; }

    public Guid WorkItemId { get; init; }

    public string FileName { get; init; } = string.Empty;

    public bool IsDeleted { get; init; }

    public DateTime? DeletedAt { get; init; }
}