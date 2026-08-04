using FlowForge.Application.Common.Responses;
using MediatR;

namespace FlowForge.Application.Features.WorkItemHistories.Get;

public sealed record GetWorkItemHistoryQuery : IRequest<ApiResponse<List<GetWorkItemHistoryResponse>>>
{
    public Guid WorkItemId { get; init; }
}