using FlowForge.Application.Common.Responses;
using MediatR;

namespace FlowForge.Application.Features.WorkItemWatchers.Create;

public sealed record CreateWorkItemWatcherCommand : IRequest<ApiResponse<CreateWorkItemWatcherResponse>>
{
    public Guid WorkItemId { get; init; }

    public Guid UserId { get; init; }
}