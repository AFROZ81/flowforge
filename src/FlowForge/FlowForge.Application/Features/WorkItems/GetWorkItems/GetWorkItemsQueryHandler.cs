using FlowForge.Application.Common.Responses;
using FlowForge.Application.Interfaces;
using FlowForge.Application.Services.Authentication;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FlowForge.Application.Features.WorkItems.GetWorkItems;

public sealed class GetWorkItemsQueryHandler : IRequestHandler<GetWorkItemsQuery, ApiResponse<List<GetWorkItemsResponse>>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public GetWorkItemsQueryHandler(IApplicationDbContext context, ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<ApiResponse<List<GetWorkItemsResponse>>> Handle(GetWorkItemsQuery request, CancellationToken cancellationToken)
    {
        var query = _context.WorkItems
            .AsNoTracking()
            .Where(x =>
                !x.IsDeleted &&
                x.Column.Board.Project.OrganizationId ==
                    _currentUser.User.OrganizationId);

        if (request.ColumnId.HasValue)
        {
            query = query.Where(x =>
                x.ColumnId == request.ColumnId.Value);
        }

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.Trim();

            query = query.Where(x =>
                x.Title.Contains(search) ||
                (x.Description != null &&
                 x.Description.Contains(search)));
        }

        if (request.Priority.HasValue)
        {
            query = query.Where(x =>
                x.Priority == request.Priority.Value);
        }

        if (request.Status.HasValue)
        {
            query = query.Where(x =>
                x.Status == request.Status.Value);
        }

        if (request.IsArchived.HasValue)
        {
            query = query.Where(x =>
                x.IsArchived == request.IsArchived.Value);
        }

        if (request.DueBefore.HasValue)
        {
            query = query.Where(x =>
                x.DueDate <= request.DueBefore.Value);
        }

        if (request.DueAfter.HasValue)
        {
            query = query.Where(x =>
                x.DueDate >= request.DueAfter.Value);
        }

        var response = await query
            .OrderBy(x => x.DisplayOrder)
            .Select(x => new GetWorkItemsResponse
            {
                Id = x.Id,
                ColumnId = x.ColumnId,
                Title = x.Title,
                Description = x.Description,
                Priority = x.Priority,
                Status = x.Status,
                DisplayOrder = x.DisplayOrder,
                DueDate = x.DueDate,
                IsArchived = x.IsArchived
            })
            .ToListAsync(cancellationToken);

        return ApiResponse<List<GetWorkItemsResponse>>
            .SuccessResponse(
                response,
                "Work Items retrieved successfully.");
    }
}