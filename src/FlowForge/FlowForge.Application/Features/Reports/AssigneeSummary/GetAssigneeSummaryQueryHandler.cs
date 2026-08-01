using FlowForge.Application.Common.Responses;
using FlowForge.Application.Interfaces;
using FlowForge.Application.Services.Authentication;
using FlowForge.Application.Services.Users;
using FlowForge.Domain.Common.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FlowForge.Application.Features.Reports.AssigneeSummary;

public sealed class GetAssigneeSummaryQueryHandler : IRequestHandler<GetAssigneeSummaryQuery, ApiResponse<List<GetAssigneeSummaryResponse>>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly IUserService _userService;

    public GetAssigneeSummaryQueryHandler(IApplicationDbContext context, ICurrentUserService currentUser, IUserService userService)
    {
        _context = context;
        _currentUser = currentUser;
        _userService = userService;
    }

    public async Task<ApiResponse<List<GetAssigneeSummaryResponse>>> Handle(GetAssigneeSummaryQuery request, CancellationToken cancellationToken)
    {
        var organizationId = _currentUser.User.OrganizationId;

        var users = await _userService.GetByOrganizationAsync(organizationId, cancellationToken);

        var workItems = await _context.WorkItems
            .AsNoTracking()
            .Where(x =>
                !x.IsDeleted &&
                x.AssigneeId != null &&
                x.Column.Board.Project.OrganizationId == organizationId)
            .ToListAsync(cancellationToken);

        var response = users
            .Select(user => new GetAssigneeSummaryResponse
            {
                UserId = user.Id,
                FullName = user.FullName,
                Email = user.Email,

                Assigned = workItems.Count(x => x.AssigneeId == user.Id),

                Active = workItems.Count(x =>
                    x.AssigneeId == user.Id &&
                    x.Status == WorkItemStatus.Active),

                Completed = workItems.Count(x =>
                    x.AssigneeId == user.Id &&
                    x.Status == WorkItemStatus.Completed),

                Blocked = workItems.Count(x =>
                    x.AssigneeId == user.Id &&
                    x.Status == WorkItemStatus.Blocked),

                Overdue = workItems.Count(x =>
                    x.AssigneeId == user.Id &&
                    x.Status != WorkItemStatus.Completed &&
                    x.DueDate.HasValue &&
                    x.DueDate.Value < DateTime.UtcNow)
            })
            .OrderByDescending(x => x.Assigned)
            .ToList();

        return ApiResponse<List<GetAssigneeSummaryResponse>>.SuccessResponse(response, "Assignee summary retrieved successfully.");
    }
}