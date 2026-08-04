using FlowForge.Application.Common.Responses;
using FlowForge.Application.Features.Boards;
using FlowForge.Application.Interfaces;
using FlowForge.Application.Services.Authentication;
using MediatR;

namespace FlowForge.Application.Features.Boards.Restore;

public sealed class RestoreBoardHandler
    : IRequestHandler<RestoreBoardCommand, ApiResponse<RestoreBoardResponse>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly BoardRules _boardRules;

    public RestoreBoardHandler(IApplicationDbContext context, ICurrentUserService currentUser, BoardRules boardRules)
    {
        _context = context;
        _currentUser = currentUser;
        _boardRules = boardRules;
    }

    public async Task<ApiResponse<RestoreBoardResponse>> Handle(RestoreBoardCommand request, CancellationToken cancellationToken)
    {
        var board = await _boardRules.GetByIdAsync(request.BoardId, _currentUser.User.OrganizationId, cancellationToken);

        _boardRules.EnsureArchived(board);

        board.Restore();

        await _context.SaveChangesAsync(cancellationToken);

        return ApiResponse<RestoreBoardResponse>.SuccessResponse(
            new RestoreBoardResponse
            {
                Id = board.Id,
                IsArchived = board.IsArchived
            },
            "Board restored successfully.");
    }
}