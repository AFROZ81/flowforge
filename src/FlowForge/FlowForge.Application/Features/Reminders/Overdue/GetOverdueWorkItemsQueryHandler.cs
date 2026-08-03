using FlowForge.Application.Common.Responses;
using FlowForge.Application.Interfaces;
using FlowForge.Application.Services.Authentication;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FlowForge.Application.Features.Reminders.Overdue;

public sealed class GetOverdueWorkItemsQueryHandler : IRequestHandler<GetOverdueWorkItemsQuery, ApiResponse<List<GetOverdueWorkItemsResponse>>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public GetOverdueWorkItemsQueryHandler(IApplicationDbContext context, ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<ApiResponse<List<GetOverdueWorkItemsResponse>>> Handle(GetOverdueWorkItemsQuery request, CancellationToken cancellationToken)
    {
        var currentUser = _currentUser.User;

        var overdue = await _context.WorkItems
            .AsNoTracking()
            .Include(x => x.Column)
                .ThenInclude(x => x.Board)
                    .ThenInclude(x => x.Project)
            .Where(x =>
                !x.IsDeleted &&
                !x.IsArchived &&
                x.DueDate.HasValue &&
                x.DueDate < DateTime.UtcNow &&
                x.Column.Board.Project.OrganizationId ==
                    currentUser.OrganizationId)
            .OrderBy(x => x.DueDate)
            .Select(x => new GetOverdueWorkItemsResponse
            {
                WorkItemId = x.Id,
                Title = x.Title,
                DueDate = x.DueDate
            })
            .ToListAsync(cancellationToken);

        return ApiResponse<List<GetOverdueWorkItemsResponse>>.SuccessResponse(overdue, "Overdue work items retrieved successfully.");
    }
}