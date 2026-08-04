using FlowForge.Application.Common.Responses;
using FlowForge.Application.Interfaces;
using FlowForge.Application.Services.Authentication;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FlowForge.Application.Features.Columns.GetColumns;

public sealed class GetColumnsQueryHandler
    : IRequestHandler<GetColumnsQuery, ApiResponse<List<GetColumnsResponse>>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly ColumnRules _columnRules;

    public GetColumnsQueryHandler(IApplicationDbContext context, ICurrentUserService currentUser, ColumnRules columnRules)
    {
        _context = context;
        _currentUser = currentUser;
        _columnRules = columnRules;
    }

    public async Task<ApiResponse<List<GetColumnsResponse>>> Handle(GetColumnsQuery request, CancellationToken cancellationToken)
    {
        // Validate board ownership
        await _columnRules.GetBoardAsync(request.BoardId, _currentUser.User.OrganizationId, cancellationToken);

        var columns = await _context.Columns
            .AsNoTracking()
            .Where(c =>
                c.BoardId == request.BoardId &&
                !c.IsDeleted &&
                !c.IsArchived)
            .OrderBy(c => c.DisplayOrder)
            .Select(c => new GetColumnsResponse
            {
                Id = c.Id,
                BoardId = c.BoardId,
                Name = c.Name,
                Description = c.Description,
                DisplayOrder = c.DisplayOrder,
                IsArchived = c.IsArchived
            })
            .ToListAsync(cancellationToken);

        return ApiResponse<List<GetColumnsResponse>>.SuccessResponse(columns, "Columns retrieved successfully.");
    }
}