using Microsoft.AspNetCore.Http;

namespace FlowForge.API.Models.Attachments;

public sealed class UploadAttachmentRequest
{
    public Guid WorkItemId { get; set; }

    public IFormFile File { get; set; } = default!;
}