using FlowForge.Application.Common.Responses;
using FlowForge.Application.Interfaces;
using FlowForge.Application.Services.Authentication;
using FlowForge.Domain.Entities;
using MediatR;

namespace FlowForge.Application.Features.Boards.Create;

public sealed class CreateBoardCommandHandler : IRequestHandler<CreateBoardCommand, ApiResponse<CreateBoardResponse>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly BoardRules _boardRules;

    public CreateBoardCommandHandler(IApplicationDbContext context, ICurrentUserService currentUser, BoardRules boardRules)
    {
        _context = context;
        _currentUser = currentUser;
        _boardRules = boardRules;
    }

    public async Task<ApiResponse<CreateBoardResponse>> Handle(CreateBoardCommand request, CancellationToken cancellationToken)
    {
        var project = await _boardRules.GetProjectAsync(request.ProjectId, _currentUser.User.OrganizationId, cancellationToken);

        _boardRules.EnsureProjectNotArchived(project);

        await _boardRules.EnsureNameUniqueAsync(request.ProjectId, request.Name, null, cancellationToken);

        var board = new Board(request.ProjectId, request.Name, request.Description);

        _context.Boards.Add(board);

        await _context.SaveChangesAsync(cancellationToken);

        return ApiResponse<CreateBoardResponse>.SuccessResponse(new CreateBoardResponse
            {
                Id = board.Id,
                Name = board.Name,
                ProjectId = board.ProjectId
            },
            "Board created successfully.");
    }
}