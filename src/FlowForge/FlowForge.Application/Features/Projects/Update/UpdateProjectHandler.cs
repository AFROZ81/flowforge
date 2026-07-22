using FlowForge.Application.Common.Responses;
using FlowForge.Application.Features.Projects;
using FlowForge.Application.Interfaces;
using FlowForge.Application.Services.Authentication;
using MediatR;

namespace FlowForge.Application.Features.Projects.Update;

public sealed class UpdateProjectHandler
    : IRequestHandler<UpdateProjectCommand, ApiResponse<UpdateProjectResponse>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly ProjectRules _projectRules;

    public UpdateProjectHandler(IApplicationDbContext context, ICurrentUserService currentUser, ProjectRules projectRules)
    {
        _context = context;
        _currentUser = currentUser;
        _projectRules = projectRules;
    }

    public async Task<ApiResponse<UpdateProjectResponse>> Handle(UpdateProjectCommand request, CancellationToken cancellationToken)
    {
        var project = await _projectRules.GetByIdAsync(
            request.ProjectId,
            _currentUser.User.OrganizationId,
            cancellationToken);

        await _projectRules.EnsureNameUniqueAsync(
            request.Name,
            _currentUser.User.OrganizationId,
            project.Id,
            cancellationToken);

        project.Update(
            request.Name,
            request.Key,
            request.Description,
            request.Color,
            request.Icon);

        await _context.SaveChangesAsync(cancellationToken);

        return ApiResponse<UpdateProjectResponse>.SuccessResponse(new UpdateProjectResponse
            {
                Id = project.Id,
                Name = project.Name
            },
            "Project updated successfully.");
    }
}