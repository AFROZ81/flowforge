using FlowForge.Application.Common.Responses;
using MediatR;

namespace FlowForge.Application.Features.WorkItems.Assign;

public sealed record AssignWorkItemCommand : IRequest<ApiResponse<AssignWorkItemResponse>>
{
    public Guid WorkItemId { get; init; }

    public Guid AssigneeId { get; init; }
}