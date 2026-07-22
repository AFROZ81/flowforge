using FlowForge.Application.Common.Responses;
using MediatR;

namespace FlowForge.Application.Features.Projects.Update;

public sealed record UpdateProjectCommand(
    Guid ProjectId,
    string Name,
    string Key,
    string? Description,
    string Color,
    string Icon
) : IRequest<ApiResponse<UpdateProjectResponse>>;