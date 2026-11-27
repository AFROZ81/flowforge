using FlowForge.Application.Common.Responses;
using MediatR;

namespace FlowForge.Application.Features.WorkItems.Delete;

public sealed record DeleteWorkItemCommand : IRequest<ApiResponse<DeleteWorkItemResponse>>
{
    public Guid WorkItemId { get; init; }
}
