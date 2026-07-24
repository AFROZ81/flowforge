using FlowForge.Application.Common.Responses;
using MediatR;

namespace FlowForge.Application.Features.WorkItems.Complete;

public sealed record CompleteWorkItemCommand : IRequest<ApiResponse<CompleteWorkItemResponse>>
{
    public Guid WorkItemId { get; init; }
}