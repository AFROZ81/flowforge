using FlowForge.Application.Common.Responses;
using FlowForge.Application.Interfaces;
using FlowForge.Application.Services.Authentication;
using FlowForge.Domain.Common.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FlowForge.Application.Features.Reports.ProjectSummary;

public sealed class GetProjectSummaryQueryHandler : IRequestHandler<GetProjectSummaryQuery, ApiResponse<List<GetProjectSummaryResponse>>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public GetProjectSummaryQueryHandler(IApplicationDbContext context, ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<ApiResponse<List<GetProjectSummaryResponse>>> Handle(GetProjectSummaryQuery request, CancellationToken cancellationToken)
    {
        var organizationId = _currentUser.User.OrganizationId;

        var projects = await _context.Projects
            .AsNoTracking()
            .Where(p =>
                !p.IsDeleted &&
                p.OrganizationId == organizationId)
            .Select(project => new GetProjectSummaryResponse
            {
                ProjectId = project.Id,

                ProjectName = project.Name,

                Total = project.Boards
                    .SelectMany(b => b.Columns)
                    .SelectMany(c => c.WorkItems)
                    .Count(w => !w.IsDeleted),

                Active = project.Boards
                    .SelectMany(b => b.Columns)
                    .SelectMany(c => c.WorkItems)
                    .Count(w =>
                        !w.IsDeleted &&
                        w.Status == WorkItemStatus.Active),

                Completed = project.Boards
                    .SelectMany(b => b.Columns)
                    .SelectMany(c => c.WorkItems)
                    .Count(w =>
                        !w.IsDeleted &&
                        w.Status == WorkItemStatus.Completed),

                Blocked = project.Boards
                    .SelectMany(b => b.Columns)
                    .SelectMany(c => c.WorkItems)
                    .Count(w =>
                        !w.IsDeleted &&
                        w.Status == WorkItemStatus.Blocked),

                CompletionPercentage =
                    project.Boards
                        .SelectMany(b => b.Columns)
                        .SelectMany(c => c.WorkItems)
                        .Count(w =>
                            !w.IsDeleted &&
                            w.Status == WorkItemStatus.Completed) == 0
                    ? 0
                    : Math.Round(
                        (
                            project.Boards
                                .SelectMany(b => b.Columns)
                                .SelectMany(c => c.WorkItems)
                                .Count(w =>
                                    !w.IsDeleted &&
                                    w.Status == WorkItemStatus.Completed)
                            * 100.0
                        ) /
                        project.Boards
                            .SelectMany(b => b.Columns)
                            .SelectMany(c => c.WorkItems)
                            .Count(w => !w.IsDeleted),
                        2)
            })
            .OrderBy(x => x.ProjectName)
            .ToListAsync(cancellationToken);

        return ApiResponse<List<GetProjectSummaryResponse>>.SuccessResponse(projects, "Project summary retrieved successfully.");
    }
}