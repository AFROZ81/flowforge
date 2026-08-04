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

    public async Task<Project> GetProjectAsync(Guid projectId, Guid organizationId, CancellationToken cancellationToken)
    {
        var project = await _context.Projects
            .FirstOrDefaultAsync(
                x => x.Id == projectId &&
                     x.OrganizationId == organizationId,
                cancellationToken);

        if (project is null)
            throw new NotFoundException("Project not found.");

        return project;
    }

    public async Task EnsureNameUniqueAsync(Guid projectId, string boardName, Guid? ignoreBoardId, CancellationToken cancellationToken)
    {
        var exists = await _context.Boards.AnyAsync(
            x => x.ProjectId == projectId &&
                 x.Name == boardName &&
                 (!ignoreBoardId.HasValue || x.Id != ignoreBoardId),
            cancellationToken);

        if (exists)
            throw new BadRequestException(
                "A board with this name already exists.");
    }

    public async Task<Board> GetByIdAsync(Guid boardId, Guid organizationId, CancellationToken cancellationToken)
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

    public void EnsureProjectNotArchived(Project project)
    {
        if (project.IsArchived)
            throw new BadRequestException("Cannot manage boards in an archived project.");
    }

    public void EnsureNotArchived(Board board)
    {
        if (board.IsArchived)
            throw new BadRequestException("Board is already archived.");
    }

    public void EnsureArchived(Board board)
    {
        if (!board.IsArchived)
            throw new BadRequestException("Board is not archived.");
    }
}