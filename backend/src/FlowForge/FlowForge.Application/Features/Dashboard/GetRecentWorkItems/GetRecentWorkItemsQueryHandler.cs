using FlowForge.Application.Common.Responses;
using FlowForge.Application.Interfaces;
using FlowForge.Application.Services.Authentication;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FlowForge.Application.Features.Dashboard.GetRecentWorkItems;

public sealed class GetRecentWorkItemsQueryHandler : IRequestHandler<GetRecentWorkItemsQuery, ApiResponse<List<GetRecentWorkItemsResponse>>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public GetRecentWorkItemsQueryHandler(IApplicationDbContext context, ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<ApiResponse<List<GetRecentWorkItemsResponse>>> Handle(GetRecentWorkItemsQuery request, CancellationToken cancellationToken)
    {
        var currentUser = _currentUser.User;

        var workItems = await _context.WorkItems
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
                !x.IsArchived)
            .OrderByDescending(x =>
                x.UpdatedAt ?? x.CreatedAt)
            .Take(10)
            .Select(x => new GetRecentWorkItemsResponse
            {
                WorkItemId = x.Id,
                Title = x.Title,

                Status = x.Status.ToString(),
                Priority = x.Priority.ToString(),

                DueDate = x.DueDate,

                ProjectId = x.Column.Board.Project.Id,
                ProjectName = x.Column.Board.Project.Name,
                ProjectKey = x.Column.Board.Project.Key,

                BoardId = x.Column.Board.Id,
                BoardName = x.Column.Board.Name,

                ColumnId = x.Column.Id,
                ColumnName = x.Column.Name,

                LastActivityAt =
                    x.UpdatedAt ?? x.CreatedAt
            })
            .ToListAsync(cancellationToken);

        return ApiResponse<List<GetRecentWorkItemsResponse>>.SuccessResponse(workItems, "Recent Work Items retrieved successfully.");
    }
}