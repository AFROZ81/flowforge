using FlowForge.Application.Common.Responses;
using MediatR;

namespace FlowForge.Application.Features.Projects.Restore;

public sealed record RestoreProjectCommand : IRequest<ApiResponse<RestoreProjectResponse>>
{
    public Guid ProjectId { get; init; }
}