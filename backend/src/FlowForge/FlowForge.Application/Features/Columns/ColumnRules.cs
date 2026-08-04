using FlowForge.Application.Common.Exceptions;
using FlowForge.Application.Interfaces;
using FlowForge.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace FlowForge.Application.Features.Columns;

public sealed class ColumnRules
{
    private readonly IApplicationDbContext _context;

    public ColumnRules(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Board> GetBoardAsync(Guid boardId, Guid organizationId, CancellationToken cancellationToken)
    {
        var board = await _context.Boards
            .Include(x => x.Project)
            .FirstOrDefaultAsync(
                x => x.Id == boardId &&
                     x.Project.OrganizationId == organizationId,
                cancellationToken);

        if (board is null)
            throw new NotFoundException("Board not found.");

        return board;
    }

    public async Task EnsureNameUniqueAsync(Guid boardId, string columnName, Guid? ignoreColumnId, CancellationToken cancellationToken)
    {
        var exists = await _context.Columns.AnyAsync(
            x => x.BoardId == boardId &&
                 x.Name == columnName &&
                 (!ignoreColumnId.HasValue || x.Id != ignoreColumnId),
            cancellationToken);

        if (exists)
            throw new BadRequestException(
                "A column with this name already exists.");
    }

    public async Task<Column> GetByIdAsync(Guid columnId, Guid organizationId, CancellationToken cancellationToken)
    {
        var column = await _context.Columns
            .Include(x => x.Board)
                .ThenInclude(x => x.Project)
            .FirstOrDefaultAsync(
                x => x.Id == columnId &&
                     x.Board.Project.OrganizationId == organizationId,
                cancellationToken);

        if (column is null)
            throw new NotFoundException("Column not found.");

        return column;
    }

    public void EnsureBoardNotArchived(Board board)
    {
        if (board.IsArchived)
            throw new BadRequestException(
                "Cannot manage columns in an archived board.");
    }

    public void EnsureNotArchived(Column column)
    {
        if (column.IsArchived)
            throw new BadRequestException(
                "Column is already archived.");
    }

    public void EnsureArchived(Column column)
    {
        if (!column.IsArchived)
            throw new BadRequestException(
                "Column is not archived.");
    }

    public void EnsureValidDisplayOrder(int displayOrder)
    {
        if (displayOrder <= 0)
            throw new BadRequestException(
                "Display order must be greater than zero.");
    }
}