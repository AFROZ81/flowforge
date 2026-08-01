using FlowForge.Application.Common.Responses;
using FlowForge.Application.Interfaces;
using FlowForge.Application.Services.Authentication;
using FlowForge.Domain.Common.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FlowForge.Application.Features.Reports.WorkItemSummary;

public sealed class GetWorkItemSummaryQueryHandler : IRequestHandler<GetWorkItemSummaryQuery, ApiResponse<GetWorkItemSummaryResponse>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public GetWorkItemSummaryQueryHandler(IApplicationDbContext context, ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<ApiResponse<GetWorkItemSummaryResponse>> Handle(GetWorkItemSummaryQuery request, CancellationToken cancellationToken)
    {
        var organizationId = _currentUser.User.OrganizationId;

        var workItems = _context.WorkItems
            .AsNoTracking()
            .Where(x =>
                !x.IsDeleted &&
                x.Column.Board.Project.OrganizationId == organizationId);

        var response = new GetWorkItemSummaryResponse
        {
            Total = await workItems.CountAsync(cancellationToken),

            Active = await workItems.CountAsync(
                x => x.Status == WorkItemStatus.Active,
                cancellationToken),

            Completed = await workItems.CountAsync(
                x => x.Status == WorkItemStatus.Completed,
                cancellationToken),

            Blocked = await workItems.CountAsync(
                x => x.Status == WorkItemStatus.Blocked,
                cancellationToken),

            Archived = await workItems.CountAsync(
                x => x.IsArchived,
                cancellationToken),

            Assigned = await workItems.CountAsync(
                x => x.AssigneeId != null,
                cancellationToken),

            Unassigned = await workItems.CountAsync(
                x => x.AssigneeId == null,
                cancellationToken),

            Overdue = await workItems.CountAsync(
                x =>
                    !x.IsArchived &&
                    x.Status != WorkItemStatus.Completed &&
                    x.DueDate.HasValue &&
                    x.DueDate.Value < DateTime.UtcNow,
                cancellationToken)
        };

        return ApiResponse<GetWorkItemSummaryResponse>.SuccessResponse(response, "Work Item summary retrieved successfully.");
    }
}