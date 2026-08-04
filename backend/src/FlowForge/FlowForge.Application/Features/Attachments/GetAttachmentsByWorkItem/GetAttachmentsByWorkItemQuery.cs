using FlowForge.Application.Common.Responses;
using MediatR;

namespace FlowForge.Application.Features.Attachments.GetAttachmentsByWorkItem;

public sealed record GetAttachmentsByWorkItemQuery : IRequest<ApiResponse<List<GetAttachmentsByWorkItemResponse>>>
{
    public Guid WorkItemId { get; init; }
}