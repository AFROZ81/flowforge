using System.Linq.Expressions;
using FlowForge.Application.Common.Pagination;
using FlowForge.Application.Common.Responses;
using FlowForge.Application.Features.Boards;
using FlowForge.Application.Interfaces;
using FlowForge.Application.Services.Authentication;
using FlowForge.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FlowForge.Application.Features.Boards.GetBoards;

public sealed class GetBoardsHandler
    : IRequestHandler<GetBoardsQuery, ApiResponse<PagedResponse<GetBoardsResponse>>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly BoardRules _boardRules;

    public GetBoardsHandler(IApplicationDbContext context, ICurrentUserService currentUser, BoardRules boardRules)
    {
        _context = context;
        _currentUser = currentUser;
        _boardRules = boardRules;
    }

    public async Task<ApiResponse<PagedResponse<GetBoardsResponse>>> Handle(GetBoardsQuery request, CancellationToken cancellationToken)
    {
        // Ensure the project exists and belongs to the current organization
        await _boardRules.GetProjectAsync(request.ProjectId, _currentUser.User.OrganizationId, cancellationToken);

        var query = _context.Boards
            .Where(x =>
                x.ProjectId == request.ProjectId &&
                x.Project.OrganizationId == _currentUser.User.OrganizationId);

        // Exclude archived boards by default
        if (!request.IncludeArchived)
        {
            query = query.Where(x => !x.IsArchived);
        }

        // Search
        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            query = query.Where(x =>
                x.Name.Contains(request.Search) ||
                (x.Description != null &&
                 x.Description.Contains(request.Search)));
        }

        // Sorting
        var sortMappings = new Dictionary<string, Expression<Func<Board, object>>>
        {
            ["name"] = x => x.Name,
            ["createdAt"] = x => x.CreatedAt
        };

        query = query.ApplySorting(
            request.SortBy,
            request.SortDirection.Equals("desc", StringComparison.OrdinalIgnoreCase),
            sortMappings,
            x => x.CreatedAt);

        var projectedQuery = query.Select(x => new GetBoardsResponse
        {
            Id = x.Id,
            Name = x.Name,
            Description = x.Description,
            IsArchived = x.IsArchived,
            CreatedAt = x.CreatedAt
        });
 
        var pagedResult = await projectedQuery.ToPagedResponseAsync(request, cancellationToken); 

        return ApiResponse<PagedResponse<GetBoardsResponse>>.SuccessResponse(pagedResult);
    }
}