using FlowForge.Application.Common.Responses;
using MediatR;

namespace FlowForge.Application.Features.WorkItems.Activate;

public sealed record ActivateWorkItemCommand : IRequest<ApiResponse<ActivateWorkItemResponse>>
{
    public Guid WorkItemId { get; init; }
}