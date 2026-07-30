using FlowForge.Application.Common.Responses;
using MediatR;

namespace FlowForge.Application.Features.Comments.GetCommentsByWorkItem;

public sealed record GetCommentsByWorkItemQuery : IRequest<ApiResponse<List<GetCommentsByWorkItemResponse>>>
{
    public Guid WorkItemId { get; init; }
}