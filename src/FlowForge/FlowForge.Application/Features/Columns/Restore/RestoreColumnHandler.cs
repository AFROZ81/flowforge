using FlowForge.Application.Common.Responses;
using FlowForge.Application.Interfaces;
using FlowForge.Application.Services.Authentication;
using MediatR;

namespace FlowForge.Application.Features.Columns.Restore;

public sealed class RestoreColumnHandler
    : IRequestHandler<RestoreColumnCommand, ApiResponse<RestoreColumnResponse>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly ColumnRules _columnRules;

    public RestoreColumnHandler(IApplicationDbContext context, ICurrentUserService currentUser, ColumnRules columnRules)
    {
        _context = context;
        _currentUser = currentUser;
        _columnRules = columnRules;
    }

    public async Task<ApiResponse<RestoreColumnResponse>> Handle(RestoreColumnCommand request, CancellationToken cancellationToken)
    {
        var column = await _columnRules.GetByIdAsync(request.Id, _currentUser.User.OrganizationId, cancellationToken);

        _columnRules.EnsureArchived(column);

        column.Restore();

        await _context.SaveChangesAsync(cancellationToken);

        return ApiResponse<RestoreColumnResponse>.SuccessResponse(
            new RestoreColumnResponse
            {
                Id = column.Id,
                IsArchived = column.IsArchived
            },
            "Column restored successfully.");
    }
}