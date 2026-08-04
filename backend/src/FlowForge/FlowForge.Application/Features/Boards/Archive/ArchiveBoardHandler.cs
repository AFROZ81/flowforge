using FlowForge.Application.Common.Responses;
using FlowForge.Application.Features.Boards;
using FlowForge.Application.Interfaces;
using FlowForge.Application.Services.Authentication;
using MediatR;

namespace FlowForge.Application.Features.Boards.Archive;

public sealed class ArchiveBoardHandler
    : IRequestHandler<ArchiveBoardCommand, ApiResponse<ArchiveBoardResponse>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly BoardRules _boardRules;

    public ArchiveBoardHandler(IApplicationDbContext context, ICurrentUserService currentUser, BoardRules boardRules)
    {
        _context = context;
        _currentUser = currentUser;
        _boardRules = boardRules;
    }

    public async Task<ApiResponse<ArchiveBoardResponse>> Handle(ArchiveBoardCommand request, CancellationToken cancellationToken)
    {
        var board = await _boardRules.GetByIdAsync(request.BoardId, _currentUser.User.OrganizationId, cancellationToken);

        _boardRules.EnsureNotArchived(board);

        board.Archive();

        await _context.SaveChangesAsync(cancellationToken);

        return ApiResponse<ArchiveBoardResponse>.SuccessResponse(
            new ArchiveBoardResponse
            {
                Id = board.Id,
                IsArchived = board.IsArchived
            },
            "Board archived successfully.");
    }
}