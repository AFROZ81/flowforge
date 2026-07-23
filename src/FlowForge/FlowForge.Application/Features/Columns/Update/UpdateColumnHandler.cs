using FlowForge.Application.Common.Responses;
using FlowForge.Application.Interfaces;
using FlowForge.Application.Services.Authentication;
using MediatR;

namespace FlowForge.Application.Features.Columns.Update;

public sealed class UpdateColumnCommandHandler
    : IRequestHandler<UpdateColumnCommand, ApiResponse<UpdateColumnResponse>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly ColumnRules _columnRules;

    public UpdateColumnCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser,
        ColumnRules columnRules)
    {
        _context = context;
        _currentUser = currentUser;
        _columnRules = columnRules;
    }

    public async Task<ApiResponse<UpdateColumnResponse>> Handle(UpdateColumnCommand request, CancellationToken cancellationToken)
    {
        var column = await _columnRules.GetByIdAsync(request.Id, _currentUser.User.OrganizationId, cancellationToken);

        _columnRules.EnsureNotArchived(column);

        await _columnRules.EnsureNameUniqueAsync(column.BoardId, request.Name, column.Id, cancellationToken);

        column.Update(request.Name, request.Description, column.DisplayOrder);

        await _context.SaveChangesAsync(cancellationToken);

        return ApiResponse<UpdateColumnResponse>.SuccessResponse(
            new UpdateColumnResponse
            {
                Id = column.Id,
                BoardId = column.BoardId,
                Name = column.Name,
                Description = column.Description,
                DisplayOrder = column.DisplayOrder
            },
            "Column updated successfully.");
    }
}