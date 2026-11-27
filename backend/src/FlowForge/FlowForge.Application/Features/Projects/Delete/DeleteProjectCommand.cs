using FlowForge.Application.Common.Responses;
using MediatR;

namespace FlowForge.Application.Features.Projects.Delete;

public sealed record DeleteProjectCommand : IRequest<ApiResponse<DeleteProjectResponse>>
{
    public Guid ProjectId { get; init; }
}
