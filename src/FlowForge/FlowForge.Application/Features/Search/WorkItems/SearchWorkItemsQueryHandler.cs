using FlowForge.Application.Common.Responses;
using FlowForge.Application.Interfaces;
using FlowForge.Application.Services.Authentication;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FlowForge.Application.Features.Search.WorkItems;

public sealed class SearchWorkItemsQueryHandler : IRequestHandler<SearchWorkItemsQuery, ApiResponse<List<SearchWorkItemsResponse>>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public SearchWorkItemsQueryHandler(IApplicationDbContext context, ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<ApiResponse<List<SearchWorkItemsResponse>>> Handle(SearchWorkItemsQuery request, CancellationToken cancellationToken)
    {
        var currentUser = _currentUser.User;

        var query = _context.WorkItems
            .AsNoTracking()
            .Include(x => x.Column)
                .ThenInclude(x => x.Board)
                    .ThenInclude(x => x.Project)
            .AsQueryable();

        // Organization
        query = query.Where(x =>
            !x.IsDeleted &&
            x.Column.Board.Project.OrganizationId == currentUser.OrganizationId);

        if (request.ProjectId.HasValue)
        {
            query = query.Where(x =>
                x.Column.Board.ProjectId == request.ProjectId.Value);
        }

        if (request.BoardId.HasValue)
        {
            query = query.Where(x =>
                x.Column.BoardId == request.BoardId.Value);
        }

        if (request.ColumnId.HasValue)
        {
            query = query.Where(x =>
                x.ColumnId == request.ColumnId.Value);
        }

        if (request.AssigneeId.HasValue)
        {
            query = query.Where(x =>
                x.AssigneeId == request.AssigneeId.Value);
        }

        if (request.CreatedBy.HasValue)
        {
            query = query.Where(x =>
                x.CreatedBy == request.CreatedBy.Value);
        }

        if (request.IsArchived.HasValue)
        {
            query = query.Where(x =>
                x.IsArchived == request.IsArchived.Value);
        }

        if (!string.IsNullOrWhiteSpace(request.Keyword))
        {
            query = query.Where(x =>
                x.Title.Contains(request.Keyword));
        }

        if (request.CreatedFrom.HasValue)
        {
            query = query.Where(x =>
                x.CreatedAt >= request.CreatedFrom.Value);
        }

        if (request.CreatedTo.HasValue)
        {
            query = query.Where(x =>
                x.CreatedAt <= request.CreatedTo.Value);
        }

        if (request.LabelId.HasValue)
        {
            query = query.Where(x =>
                x.WorkItemLabels.Any(l =>
                    !l.IsDeleted &&
                    l.LabelId == request.LabelId.Value));
        }

        if (request.WatcherId.HasValue)
        {
            query = query.Where(x =>
                x.Watchers.Any(w =>
                    !w.IsDeleted &&
                    w.UserId == request.WatcherId.Value));
        }

        var result = await query
            .OrderByDescending(x => x.CreatedAt)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(x => new SearchWorkItemsResponse
            {
                Id = x.Id,
                Title = x.Title,

                ProjectId = x.Column.Board.ProjectId,
                ProjectName = x.Column.Board.Project.Name,

                BoardId = x.Column.BoardId,
                BoardName = x.Column.Board.Name,

                ColumnId = x.ColumnId,
                ColumnName = x.Column.Name,

                AssigneeId = x.AssigneeId,

                IsArchived = x.IsArchived,

                CommentCount = x.Comments.Count(c => !c.IsDeleted),

                AttachmentCount = x.Attachments.Count(a => !a.IsDeleted),

                ChecklistCount = x.ChecklistItems.Count(c => !c.IsDeleted),

                CompletedChecklistCount = x.ChecklistItems.Count(c =>
                    !c.IsDeleted &&
                    c.IsCompleted),

                WatcherCount = x.Watchers.Count(w => !w.IsDeleted),

                CreatedAt = x.CreatedAt
            })
            .ToListAsync(cancellationToken);

        return ApiResponse<List<SearchWorkItemsResponse>>.SuccessResponse(result, "Search completed successfully.");
    }
}