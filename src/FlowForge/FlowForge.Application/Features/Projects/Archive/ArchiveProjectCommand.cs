using FlowForge.Application.Common.Responses;
using MediatR;

namespace FlowForge.Application.Features.Projects.Archive;

public sealed record ArchiveProjectCommand : IRequest<ApiResponse<ArchiveProjectResponse>>
{
    public Guid ProjectId { get; init; }
}