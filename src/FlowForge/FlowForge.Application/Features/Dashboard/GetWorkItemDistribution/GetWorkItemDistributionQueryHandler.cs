using FlowForge.Application.Common.Responses;
using FlowForge.Application.Interfaces;
using FlowForge.Application.Services.Authentication;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FlowForge.Application.Features.Dashboard.GetWorkItemDistribution;

public sealed class GetWorkItemDistributionQueryHandler : IRequestHandler<GetWorkItemDistributionQuery, ApiResponse<GetWorkItemDistributionResponse>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public GetWorkItemDistributionQueryHandler(IApplicationDbContext context, ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<ApiResponse<GetWorkItemDistributionResponse>> Handle(GetWorkItemDistributionQuery request, CancellationToken cancellationToken)
    {
        var currentUser = _currentUser.User;

        var workItemsQuery = _context.WorkItems
            .AsNoTracking()
            .Where(x =>
                x.Column.Board.Project.OrganizationId ==
                    currentUser.OrganizationId &&

                !x.Column.Board.Project.IsDeleted &&
                !x.Column.Board.Project.IsArchived &&

                !x.Column.Board.IsDeleted &&
                !x.Column.Board.IsArchived &&

                !x.Column.IsDeleted &&
                !x.Column.IsArchived &&

                !x.IsDeleted &&
                !x.IsArchived);

        var statusData = await workItemsQuery
            .GroupBy(x => x.Status)
            .Select(x => new
            {
                Status = x.Key,
                Count = x.Count()
            })
            .ToListAsync(cancellationToken);

        var priorityData = await workItemsQuery
            .GroupBy(x => x.Priority)
            .Select(x => new
            {
                Priority = x.Key,
                Count = x.Count()
            })
            .ToListAsync(cancellationToken);

        var totalWorkItems = statusData.Sum(x => x.Count);

        var byStatus = statusData
            .OrderBy(x => x.Status)
            .Select(x => new DashboardDistributionItem
            {
                Name = x.Status.ToString(),
                Count = x.Count,
                Percentage = CalculatePercentage(
                    x.Count,
                    totalWorkItems)
            })
            .ToList();

        var byPriority = priorityData
            .OrderBy(x => x.Priority)
            .Select(x => new DashboardDistributionItem
            {
                Name = x.Priority.ToString(),
                Count = x.Count,
                Percentage = CalculatePercentage(
                    x.Count,
                    totalWorkItems)
            })
            .ToList();

        return ApiResponse<GetWorkItemDistributionResponse>
            .SuccessResponse(
                new GetWorkItemDistributionResponse
                {
                    ByStatus = byStatus,
                    ByPriority = byPriority
                },
                "Work Item distribution retrieved successfully.");
    }

    private static decimal CalculatePercentage(int count, int total)
    {
        if (total == 0)
            return 0m;

        return Math.Round((decimal)count / total * 100m, 2);
    }
}