using FlowForge.Application.Common.Exceptions;
using FlowForge.Application.Interfaces;
using FlowForge.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace FlowForge.Application.Features.Boards;

public sealed class BoardRules
{
    private readonly IApplicationDbContext _context;

    public BoardRules(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task EnsureNameUniqueAsync(Guid projectId, string boardName, CancellationToken cancellationToken)
    {
        var exists = await _context.Boards.AnyAsync(x =>
            x.ProjectId == projectId &&
            x.Name == boardName,
            cancellationToken);

        if (exists)
            throw new BadRequestException("A board with this name already exists.");
    }

    public async Task<Board> GetByIdAsync(Guid boardId, CancellationToken cancellationToken)
    {
        var board = await _context.Boards
            .FirstOrDefaultAsync(x => x.Id == boardId,
                cancellationToken);

        if (board is null)
            throw new NotFoundException("Board not found.");

        return board;
    }

    public void EnsureNotArchived(Board board)
    {
        if (board.IsArchived)
            throw new BadRequestException("Archived boards cannot be modified.");
    }
}