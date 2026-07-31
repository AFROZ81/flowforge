using FlowForge.Application.Common.Responses;
using FlowForge.Application.Interfaces;
using FlowForge.Application.Services.Authentication;
using FlowForge.Domain.Common.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FlowForge.Application.Features.Dashboard.GetOverview;

public sealed class GetDashboardOverviewQueryHandler : IRequestHandler<GetDashboardOverviewQuery, ApiResponse<GetDashboardOverviewResponse>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public GetDashboardOverviewQueryHandler(IApplicationDbContext context, ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<ApiResponse<GetDashboardOverviewResponse>> Handle(GetDashboardOverviewQuery request, CancellationToken cancellationToken)
    {
        var currentUser = _currentUser.User;

        var organizationId = currentUser.OrganizationId;

        var totalProjects = await _context.Projects
            .AsNoTracking()
            .CountAsync(
                x => x.OrganizationId == organizationId &&
                     !x.IsDeleted &&
                     !x.IsArchived,
                cancellationToken);

        var totalBoards = await _context.Boards
            .AsNoTracking()
            .CountAsync(
                x => x.Project.OrganizationId == organizationId &&
                     !x.Project.IsDeleted &&
                     !x.Project.IsArchived &&
                     !x.IsDeleted &&
                     !x.IsArchived,
                cancellationToken);

        var workItemsQuery = _context.WorkItems
            .AsNoTracking()
            .Where(x =>
                x.Column.Board.Project.OrganizationId == organizationId &&

                !x.Column.Board.Project.IsDeleted &&
                !x.Column.Board.Project.IsArchived &&

                !x.Column.Board.IsDeleted &&
                !x.Column.Board.IsArchived &&

                !x.Column.IsDeleted &&
                !x.Column.IsArchived &&

                !x.IsDeleted &&
                !x.IsArchived);

        var totalWorkItems = await workItemsQuery
            .CountAsync(cancellationToken);

        var activeWorkItems = await workItemsQuery
            .CountAsync(
                x => x.Status == WorkItemStatus.Active,
                cancellationToken);

        var completedWorkItems = await workItemsQuery
            .CountAsync(
                x => x.Status == WorkItemStatus.Completed,
                cancellationToken);

        var blockedWorkItems = await workItemsQuery
            .CountAsync(
                x => x.Status == WorkItemStatus.Blocked,
                cancellationToken);

        var now = DateTime.UtcNow;

        var overdueWorkItems = await workItemsQuery
            .CountAsync(
                x => x.DueDate.HasValue &&
                     x.DueDate.Value < now &&
                     x.Status != WorkItemStatus.Completed,
                cancellationToken);

        var completionPercentage =
            totalWorkItems == 0
                ? 0m
                : Math.Round(
                    (decimal)completedWorkItems /
                    totalWorkItems * 100m,
                    2);

        return ApiResponse<GetDashboardOverviewResponse>
            .SuccessResponse(
                new GetDashboardOverviewResponse
                {
                    TotalProjects = totalProjects,
                    TotalBoards = totalBoards,
                    TotalWorkItems = totalWorkItems,
                    ActiveWorkItems = activeWorkItems,
                    CompletedWorkItems = completedWorkItems,
                    BlockedWorkItems = blockedWorkItems,
                    OverdueWorkItems = overdueWorkItems,
                    CompletionPercentage = completionPercentage
                },
                "Dashboard overview retrieved successfully.");
    }
}