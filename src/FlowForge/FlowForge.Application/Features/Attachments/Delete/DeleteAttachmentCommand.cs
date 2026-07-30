using FlowForge.Application.Common.Responses;
using MediatR;

namespace FlowForge.Application.Features.Attachments.Delete;

public sealed record DeleteAttachmentCommand : IRequest<ApiResponse<DeleteAttachmentResponse>>
{
    public Guid AttachmentId { get; init; }
}