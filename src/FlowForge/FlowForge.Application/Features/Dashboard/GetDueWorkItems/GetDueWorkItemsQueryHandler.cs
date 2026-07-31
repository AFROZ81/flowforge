using FlowForge.Application.Common.Responses;
using FlowForge.Application.Interfaces;
using FlowForge.Application.Services.Authentication;
using FlowForge.Domain.Common.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FlowForge.Application.Features.Dashboard.GetDueWorkItems;

public sealed class GetDueWorkItemsQueryHandler : IRequestHandler<GetDueWorkItemsQuery, ApiResponse<GetDueWorkItemsResponse>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public GetDueWorkItemsQueryHandler(IApplicationDbContext context, ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<ApiResponse<GetDueWorkItemsResponse>> Handle(GetDueWorkItemsQuery request, CancellationToken cancellationToken)
    {
        var currentUser = _currentUser.User;

        var now = DateTime.UtcNow;
        var dueSoonLimit = now.AddDays(7);

        var query = _context.WorkItems
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
                !x.IsArchived &&

                x.Status != WorkItemStatus.Completed &&
                x.DueDate.HasValue);

        var overdue = await query
            .Where(x => x.DueDate!.Value < now)
            .OrderBy(x => x.DueDate)
            .Select(x => new DueWorkItemResponse
            {
                WorkItemId = x.Id,
                Title = x.Title,

                Status = x.Status.ToString(),
                Priority = x.Priority.ToString(),

                DueDate = x.DueDate!.Value,

                ProjectId = x.Column.Board.Project.Id,
                ProjectName = x.Column.Board.Project.Name,
                ProjectKey = x.Column.Board.Project.Key,

                BoardId = x.Column.Board.Id,
                BoardName = x.Column.Board.Name,

                ColumnId = x.Column.Id,
                ColumnName = x.Column.Name
            })
            .ToListAsync(cancellationToken);

        var dueSoon = await query
            .Where(x =>
                x.DueDate!.Value >= now &&
                x.DueDate.Value <= dueSoonLimit)
            .OrderBy(x => x.DueDate)
            .Select(x => new DueWorkItemResponse
            {
                WorkItemId = x.Id,
                Title = x.Title,

                Status = x.Status.ToString(),
                Priority = x.Priority.ToString(),

                DueDate = x.DueDate!.Value,

                ProjectId = x.Column.Board.Project.Id,
                ProjectName = x.Column.Board.Project.Name,
                ProjectKey = x.Column.Board.Project.Key,

                BoardId = x.Column.Board.Id,
                BoardName = x.Column.Board.Name,

                ColumnId = x.Column.Id,
                ColumnName = x.Column.Name
            })
            .ToListAsync(cancellationToken);

        return ApiResponse<GetDueWorkItemsResponse>
            .SuccessResponse(
                new GetDueWorkItemsResponse
                {
                    Overdue = overdue,
                    DueSoon = dueSoon
                },
                "Due Work Items retrieved successfully.");
    }
}