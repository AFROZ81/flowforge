using FlowForge.Application.Common.Responses;
using MediatR;

namespace FlowForge.Application.Features.WorkItemWatchers.Get;

public sealed record GetWorkItemWatchersQuery : IRequest<ApiResponse<List<GetWorkItemWatcherResponse>>>
{
    public Guid WorkItemId { get; init; }
}