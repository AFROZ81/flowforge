using FlowForge.Application.Common.Responses;
using FlowForge.Application.Features.Boards;
using FlowForge.Application.Interfaces;
using FlowForge.Application.Services.Authentication;
using MediatR;

namespace FlowForge.Application.Features.Boards.Update;

public sealed class UpdateBoardHandler
    : IRequestHandler<UpdateBoardCommand, ApiResponse<UpdateBoardResponse>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly BoardRules _boardRules;

    public UpdateBoardHandler(IApplicationDbContext context, ICurrentUserService currentUser, BoardRules boardRules)
    {
        _context = context;
        _currentUser = currentUser;
        _boardRules = boardRules;
    }

    public async Task<ApiResponse<UpdateBoardResponse>> Handle(UpdateBoardCommand request, CancellationToken cancellationToken)
    {
        var board = await _boardRules.GetByIdAsync(request.BoardId, _currentUser.User.OrganizationId, cancellationToken);

        _boardRules.EnsureNotArchived(board);

        await _boardRules.EnsureNameUniqueAsync(board.ProjectId, request.Name, board.Id, cancellationToken);

        board.Update(request.Name, request.Description);

        await _context.SaveChangesAsync(cancellationToken);

        return ApiResponse<UpdateBoardResponse>.SuccessResponse(
            new UpdateBoardResponse
            {
                Id = board.Id,
                Name = board.Name,
                Description = board.Description
            },
            "Board updated successfully.");
    }
}