using FlowForge.Application.Common.Responses;
using MediatR;

namespace FlowForge.Application.Features.WorkItems.Unassign;

public sealed record UnassignWorkItemCommand : IRequest<ApiResponse<UnassignWorkItemResponse>>
{
    public Guid WorkItemId { get; init; }
}