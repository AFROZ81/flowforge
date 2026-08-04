using FlowForge.Application.Common.Responses;
using FlowForge.Application.Interfaces;
using FlowForge.Application.Services.Authentication;
using FlowForge.Domain.Common.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FlowForge.Application.Features.Reports.ProductivityTrends;

public sealed class GetProductivityTrendsQueryHandler : IRequestHandler<GetProductivityTrendsQuery, ApiResponse<List<GetProductivityTrendsResponse>>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public GetProductivityTrendsQueryHandler(IApplicationDbContext context, ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<ApiResponse<List<GetProductivityTrendsResponse>>> Handle(GetProductivityTrendsQuery request, CancellationToken cancellationToken)
    {
        var organizationId = _currentUser.User.OrganizationId;

        var fromDate = DateTime.UtcNow.Date.AddDays(-(request.Days - 1));

        var workItems = await _context.WorkItems
            .AsNoTracking()
            .Where(x =>
                !x.IsDeleted &&
                x.Column.Board.Project.OrganizationId == organizationId &&
                x.CreatedAt >= fromDate)
            .ToListAsync(cancellationToken);

        var response = Enumerable
            .Range(0, request.Days)
            .Select(i =>
            {
                var day = DateOnly.FromDateTime(fromDate.AddDays(i));

                return new GetProductivityTrendsResponse
                {
                    Date = day,

                    Created = workItems.Count(x =>
                        DateOnly.FromDateTime(x.CreatedAt) == day),

                    Completed = workItems.Count(x =>
                        x.Status == WorkItemStatus.Completed &&
                        x.UpdatedAt.HasValue &&
                        DateOnly.FromDateTime(x.UpdatedAt.Value) == day)
                };
            })
            .ToList();

        return ApiResponse<List<GetProductivityTrendsResponse>>.SuccessResponse(response, "Productivity trends retrieved successfully.");
    }
}