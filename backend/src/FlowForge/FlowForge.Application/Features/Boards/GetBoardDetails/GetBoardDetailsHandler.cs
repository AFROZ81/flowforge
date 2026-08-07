using FlowForge.Application.Common.Responses;
using FlowForge.Application.Features.Boards;
using FlowForge.Application.Interfaces;
using FlowForge.Application.Services.Authentication;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FlowForge.Application.Features.Boards.GetBoardDetails;

public sealed class GetBoardDetailsHandler
    : IRequestHandler<GetBoardDetailsQuery, ApiResponse<GetBoardDetailsResponse>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly BoardRules _boardRules;

    public GetBoardDetailsHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser,
        BoardRules boardRules)
    {
        _context = context;
        _currentUser = currentUser;
        _boardRules = boardRules;
    }

    public async Task<ApiResponse<GetBoardDetailsResponse>> Handle(
        GetBoardDetailsQuery request,
        CancellationToken cancellationToken)
    {
        var board = await _boardRules.GetByIdAsync(
            request.BoardId,
            _currentUser.User.OrganizationId,
            cancellationToken);

        var columns = await _context.Columns
            .AsNoTracking()
            .Where(x =>
                x.BoardId == board.Id &&
                !x.IsDeleted)
            .OrderBy(x => x.DisplayOrder)
            .ToListAsync(cancellationToken);

        var columnIds = columns
            .Select(x => x.Id)
            .ToList();

        var workItems = await _context.WorkItems
            .AsNoTracking()
            .Where(x =>
                columnIds.Contains(x.ColumnId) &&
                !x.IsDeleted)
            .OrderBy(x => x.DisplayOrder)
            .ToListAsync(cancellationToken);

        var response = new GetBoardDetailsResponse
        {
            Id = board.Id,
            ProjectId = board.ProjectId,
            Name = board.Name,
            Description = board.Description,
            IsArchived = board.IsArchived,

            Columns = columns
                .Select(column => new BoardColumnDto
                {
                    Id = column.Id,
                    Name = column.Name,
                    Description = column.Description,
                    DisplayOrder = column.DisplayOrder,

                    WorkItems = workItems
                        .Where(w => w.ColumnId == column.Id)
                        .Select(w => new BoardWorkItemDto
                        {
                            Id = w.Id,
                            Title = w.Title,
                            Description = w.Description,
                            Priority = w.Priority,
                            Status = w.Status,
                            DisplayOrder = w.DisplayOrder,
                            DueDate = w.DueDate,
                            IsArchived = w.IsArchived
                        })
                        .ToList()
                })
                .ToList()
        };

        return ApiResponse<GetBoardDetailsResponse>.SuccessResponse(response);
    }
}