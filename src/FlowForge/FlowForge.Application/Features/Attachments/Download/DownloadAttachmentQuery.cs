using MediatR;

namespace FlowForge.Application.Features.Attachments.Download;

public sealed record DownloadAttachmentQuery : IRequest<DownloadAttachmentResponse>
{
    public Guid AttachmentId { get; init; }
}