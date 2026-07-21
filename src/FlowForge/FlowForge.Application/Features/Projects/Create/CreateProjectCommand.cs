using MediatR;

namespace FlowForge.Application.Features.Projects.Create;

public sealed record CreateProjectCommand(
    string Name,
    string Key,
    string? Description,
    string Color,
    string? Icon
) : IRequest<CreateProjectResponse>;