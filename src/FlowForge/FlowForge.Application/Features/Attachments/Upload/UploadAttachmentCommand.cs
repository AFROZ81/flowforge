using FlowForge.Application.Common.Responses;
using MediatR;

namespace FlowForge.Application.Features.Attachments.Upload;

public sealed record UploadAttachmentCommand : IRequest<ApiResponse<UploadAttachmentResponse>>
{
    public Guid WorkItemId { get; init; }

    public string FileName { get; init; } = string.Empty;

    public string ContentType { get; init; } = string.Empty;

    public long FileSize { get; init; }

    public Stream Content { get; init; } = Stream.Null;
}