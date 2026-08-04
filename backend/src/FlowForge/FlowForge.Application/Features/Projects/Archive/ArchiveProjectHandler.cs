using FlowForge.Application.Common.Responses;
using FlowForge.Application.Features.Projects;
using FlowForge.Application.Interfaces;
using FlowForge.Application.Services.Authentication;
using MediatR;

namespace FlowForge.Application.Features.Projects.Archive;

public sealed class ArchiveProjectHandler
    : IRequestHandler<ArchiveProjectCommand, ApiResponse<ArchiveProjectResponse>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly ProjectRules _projectRules;

    public ArchiveProjectHandler(IApplicationDbContext context, ICurrentUserService currentUser, ProjectRules projectRules)
    {
        _context = context;
        _currentUser = currentUser;
        _projectRules = projectRules;
    }

    public async Task<ApiResponse<ArchiveProjectResponse>> Handle(ArchiveProjectCommand request, CancellationToken cancellationToken)
    {
        var project = await _projectRules.GetByIdAsync(
            request.ProjectId,
            _currentUser.User.OrganizationId,
            cancellationToken);

        _projectRules.EnsureNotArchived(project);

        project.Archive();

        await _context.SaveChangesAsync(cancellationToken);

        return ApiResponse<ArchiveProjectResponse>.SuccessResponse(new ArchiveProjectResponse
            {
                Id = project.Id,
                IsArchived = project.IsArchived
            },
            "Project archived successfully.");
    }
}