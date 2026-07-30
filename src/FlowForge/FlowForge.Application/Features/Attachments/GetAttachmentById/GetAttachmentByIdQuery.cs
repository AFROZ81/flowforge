using FlowForge.Application.Common.Responses;
using MediatR;

namespace FlowForge.Application.Features.Attachments.GetAttachmentById;

public sealed record GetAttachmentByIdQuery : IRequest<ApiResponse<GetAttachmentByIdResponse>>
{
    public Guid Id { get; init; }
}