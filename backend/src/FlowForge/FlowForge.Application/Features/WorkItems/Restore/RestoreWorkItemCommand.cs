using FlowForge.Application.Common.Responses;
using MediatR;

namespace FlowForge.Application.Features.WorkItems.Restore;

public sealed record RestoreWorkItemCommand : IRequest<ApiResponse<RestoreWorkItemResponse>>
{
    public Guid WorkItemId { get; init; }
}