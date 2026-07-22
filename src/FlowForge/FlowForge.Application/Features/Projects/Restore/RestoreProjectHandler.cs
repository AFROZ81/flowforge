using FlowForge.Application.Common.Responses;
using FlowForge.Application.Features.Projects;
using FlowForge.Application.Interfaces;
using FlowForge.Application.Services.Authentication;
using MediatR;

namespace FlowForge.Application.Features.Projects.Restore;

public sealed class RestoreProjectHandler
    : IRequestHandler<RestoreProjectCommand, ApiResponse<RestoreProjectResponse>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly ProjectRules _projectRules;

    public RestoreProjectHandler(IApplicationDbContext context, ICurrentUserService currentUser, ProjectRules projectRules)
    {
        _context = context;
        _currentUser = currentUser;
        _projectRules = projectRules;
    }

    public async Task<ApiResponse<RestoreProjectResponse>> Handle(RestoreProjectCommand request, CancellationToken cancellationToken)
    {
        var project = await _projectRules.GetByIdAsync(
            request.ProjectId,
            _currentUser.User.OrganizationId,
            cancellationToken);

        _projectRules.EnsureArchived(project);

        project.Restore();

        await _context.SaveChangesAsync(cancellationToken);

        return ApiResponse<RestoreProjectResponse>.SuccessResponse(new RestoreProjectResponse
            {
                Id = project.Id,
                IsArchived = project.IsArchived
            },
            "Project restored successfully.");
    }
}