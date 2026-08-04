using FlowForge.Application.Common.Responses;
using FlowForge.Application.Interfaces;
using FlowForge.Application.Services.Authentication;
using MediatR;

namespace FlowForge.Application.Features.Columns.Archive;

public sealed class ArchiveColumnHandler
    : IRequestHandler<ArchiveColumnCommand, ApiResponse<ArchiveColumnResponse>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly ColumnRules _columnRules;

    public ArchiveColumnHandler(IApplicationDbContext context, ICurrentUserService currentUser, ColumnRules columnRules)
    {
        _context = context;
        _currentUser = currentUser;
        _columnRules = columnRules;
    }

    public async Task<ApiResponse<ArchiveColumnResponse>> Handle(ArchiveColumnCommand request, CancellationToken cancellationToken)
    {
        var column = await _columnRules.GetByIdAsync(request.Id, _currentUser.User.OrganizationId, cancellationToken);

        _columnRules.EnsureNotArchived(column);

        column.Archive();

        await _context.SaveChangesAsync(cancellationToken);

        return ApiResponse<ArchiveColumnResponse>.SuccessResponse(
            new ArchiveColumnResponse
            {
                Id = column.Id,
                IsArchived = column.IsArchived
            },
            "Column archived successfully.");
    }
}