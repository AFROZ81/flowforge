using FlowForge.Application.Common.Responses;
using FlowForge.Application.Interfaces;
using FlowForge.Application.Services.Authentication;
using FlowForge.Domain.Common.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FlowForge.Application.Features.Dashboard.GetProjectProgress;

public sealed class GetProjectProgressQueryHandler : IRequestHandler<GetProjectProgressQuery, ApiResponse<List<GetProjectProgressResponse>>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public GetProjectProgressQueryHandler(IApplicationDbContext context, ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<ApiResponse<List<GetProjectProgressResponse>>> Handle(GetProjectProgressQuery request, CancellationToken cancellationToken)
    {
        var currentUser = _currentUser.User;

        var organizationId = currentUser.OrganizationId;
        var now = DateTime.UtcNow;

        var projects = await _context.Projects
            .AsNoTracking()
            .Where(x =>
                x.OrganizationId == organizationId &&
                !x.IsDeleted &&
                !x.IsArchived)
            .Select(x => new
            {
                x.Id,
                x.Name,
                x.Key,
                x.Color,

                TotalWorkItems = x.Boards
                    .Where(b =>
                        !b.IsDeleted &&
                        !b.IsArchived)
                    .SelectMany(b => b.Columns)
                    .Where(c =>
                        !c.IsDeleted &&
                        !c.IsArchived)
                    .SelectMany(c => c.WorkItems)
                    .Count(w =>
                        !w.IsDeleted &&
                        !w.IsArchived),

                ActiveWorkItems = x.Boards
                    .Where(b =>
                        !b.IsDeleted &&
                        !b.IsArchived)
                    .SelectMany(b => b.Columns)
                    .Where(c =>
                        !c.IsDeleted &&
                        !c.IsArchived)
                    .SelectMany(c => c.WorkItems)
                    .Count(w =>
                        !w.IsDeleted &&
                        !w.IsArchived &&
                        w.Status == WorkItemStatus.Active),

                CompletedWorkItems = x.Boards
                    .Where(b =>
                        !b.IsDeleted &&
                        !b.IsArchived)
                    .SelectMany(b => b.Columns)
                    .Where(c =>
                        !c.IsDeleted &&
                        !c.IsArchived)
                    .SelectMany(c => c.WorkItems)
                    .Count(w =>
                        !w.IsDeleted &&
                        !w.IsArchived &&
                        w.Status == WorkItemStatus.Completed),

                BlockedWorkItems = x.Boards
                    .Where(b =>
                        !b.IsDeleted &&
                        !b.IsArchived)
                    .SelectMany(b => b.Columns)
                    .Where(c =>
                        !c.IsDeleted &&
                        !c.IsArchived)
                    .SelectMany(c => c.WorkItems)
                    .Count(w =>
                        !w.IsDeleted &&
                        !w.IsArchived &&
                        w.Status == WorkItemStatus.Blocked),

                OverdueWorkItems = x.Boards
                    .Where(b =>
                        !b.IsDeleted &&
                        !b.IsArchived)
                    .SelectMany(b => b.Columns)
                    .Where(c =>
                        !c.IsDeleted &&
                        !c.IsArchived)
                    .SelectMany(c => c.WorkItems)
                    .Count(w =>
                        !w.IsDeleted &&
                        !w.IsArchived &&
                        w.DueDate.HasValue &&
                        w.DueDate.Value < now &&
                        w.Status != WorkItemStatus.Completed)
            })
            .OrderBy(x => x.Name)
            .ToListAsync(cancellationToken);

        var response = projects
            .Select(x => new GetProjectProgressResponse
            {
                ProjectId = x.Id,
                ProjectName = x.Name,
                ProjectKey = x.Key,
                Color = x.Color,

                TotalWorkItems = x.TotalWorkItems,
                ActiveWorkItems = x.ActiveWorkItems,
                CompletedWorkItems = x.CompletedWorkItems,
                BlockedWorkItems = x.BlockedWorkItems,
                OverdueWorkItems = x.OverdueWorkItems,

                CompletionPercentage =
                    x.TotalWorkItems == 0
                        ? 0m
                        : Math.Round(
                            (decimal)x.CompletedWorkItems /
                            x.TotalWorkItems * 100m,
                            2)
            })
            .ToList();

        return ApiResponse<List<GetProjectProgressResponse>>.SuccessResponse(response, "Project progress retrieved successfully.");
    }
}