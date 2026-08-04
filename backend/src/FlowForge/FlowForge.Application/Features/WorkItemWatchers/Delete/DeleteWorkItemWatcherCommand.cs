using FlowForge.Application.Common.Responses;
using MediatR;

namespace FlowForge.Application.Features.WorkItemWatchers.Delete;

public sealed record DeleteWorkItemWatcherCommand : IRequest<ApiResponse<DeleteWorkItemWatcherResponse>>
{
    public Guid WatcherId { get; init; }
}