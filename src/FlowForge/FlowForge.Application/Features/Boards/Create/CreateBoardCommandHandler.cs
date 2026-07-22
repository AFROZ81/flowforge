using FlowForge.Application.Common.Exceptions;
using FlowForge.Application.Common.Responses;
using FlowForge.Application.Interfaces;
using FlowForge.Application.Services.Authentication;
using FlowForge.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FlowForge.Application.Features.Boards.Create;

public sealed class CreateBoardCommandHandler
    : IRequestHandler<CreateBoardCommand, ApiResponse<CreateBoardResponse>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public CreateBoardCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<ApiResponse<CreateBoardResponse>> Handle(
        CreateBoardCommand request,
        CancellationToken cancellationToken)
    {
        var projectExists = await _context.Projects
            .AnyAsync(
                x => x.Id == request.ProjectId &&
                    x.OrganizationId == _currentUser.User.OrganizationId,
                cancellationToken);

        if (!projectExists)
            throw new NotFoundException("Project not found.");

        var boardExists = await _context.Boards
            .AnyAsync(
                x => x.ProjectId == request.ProjectId &&
                     x.Name == request.Name,
                cancellationToken);

        if (boardExists)
            throw new BadRequestException("A board with the same name already exists in this project.");

        var board = new Board(
            request.ProjectId,
            request.Name,
            request.Description);

        _context.Boards.Add(board);

        await _context.SaveChangesAsync(cancellationToken);

        return ApiResponse<CreateBoardResponse>.SuccessResponse(
            new CreateBoardResponse
            {
                Id = board.Id,
                Name = board.Name,
                ProjectId = board.ProjectId
            },
            "Board created successfully.");
    }
}