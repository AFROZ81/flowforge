using FlowForge.Application.Common.Responses;
using FlowForge.Application.Interfaces;
using FlowForge.Application.Services.Authentication;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FlowForge.Application.Features.WorkItems.GetByColumn;

public sealed class GetWorkItemsByColumnQueryHandler : IRequestHandler<GetWorkItemsByColumnQuery, ApiResponse<List<GetWorkItemsByColumnResponse>>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public GetWorkItemsByColumnQueryHandler(IApplicationDbContext context, ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<ApiResponse<List<GetWorkItemsByColumnResponse>>> Handle(GetWorkItemsByColumnQuery request, CancellationToken cancellationToken)
    {
        var workItems = await _context.WorkItems
            .AsNoTracking()
            .Where(x =>
                x.ColumnId == request.ColumnId &&
                !x.IsDeleted &&
                x.Column.Board.Project.OrganizationId ==
                    _currentUser.User.OrganizationId &&
                (request.IncludeArchived || !x.IsArchived))
            .OrderBy(x => x.DisplayOrder)
            .Select(x => new GetWorkItemsByColumnResponse
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

        return ApiResponse<List<GetWorkItemsByColumnResponse>>
            .SuccessResponse(workItems, "Work Items retrieved successfully.");
    }
}