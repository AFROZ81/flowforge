using FlowForge.Application.Common.Responses;
using FlowForge.Application.Interfaces;
using FlowForge.Application.Services.Authentication;
using FlowForge.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using MediatR;

namespace FlowForge.Application.Features.Columns.Create;

public sealed class CreateColumnCommandHandler
    : IRequestHandler<CreateColumnCommand, ApiResponse<CreateColumnResponse>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly ColumnRules _columnRules;

    public CreateColumnCommandHandler(IApplicationDbContext context, ICurrentUserService currentUser, ColumnRules columnRules)
    {
        _context = context;
        _currentUser = currentUser;
        _columnRules = columnRules;
    }

    public async Task<ApiResponse<CreateColumnResponse>> Handle(CreateColumnCommand request, CancellationToken cancellationToken)
    {
        var board = await _columnRules.GetBoardAsync(
            request.BoardId,
            _currentUser.User.OrganizationId,
            cancellationToken);

        _columnRules.EnsureBoardNotArchived(board);

        var nextDisplayOrder = await _context.Columns
            .Where(x => x.BoardId == request.BoardId)
            .MaxAsync(x => (int?)x.DisplayOrder, cancellationToken) ?? 0;

        await _columnRules.EnsureNameUniqueAsync(request.BoardId, request.Name, null, cancellationToken);

        var column = new Column(request.BoardId, request.Name, request.Description, nextDisplayOrder + 1);

        _context.Columns.Add(column);

        await _context.SaveChangesAsync(cancellationToken);

        return ApiResponse<CreateColumnResponse>.SuccessResponse(
            new CreateColumnResponse
            {
                Id = column.Id,
                BoardId = column.BoardId,
                Name = column.Name,
                DisplayOrder = column.DisplayOrder
            },
            "Column created successfully.");
    }
}