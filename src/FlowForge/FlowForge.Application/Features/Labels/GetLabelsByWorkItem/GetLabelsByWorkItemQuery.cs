using FlowForge.Application.Common.Responses;
using MediatR;

namespace FlowForge.Application.Features.Labels.GetLabelsByWorkItem;

public sealed record GetLabelsByWorkItemQuery : IRequest<ApiResponse<List<GetLabelsByWorkItemResponse>>>
{
    public Guid WorkItemId { get; init; }
}