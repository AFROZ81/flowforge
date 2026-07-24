using FlowForge.Application.Common.Responses;
using MediatR;

namespace FlowForge.Application.Features.WorkItems.Block;

public sealed record BlockWorkItemCommand : IRequest<ApiResponse<BlockWorkItemResponse>>
{
    public Guid WorkItemId { get; init; }
}