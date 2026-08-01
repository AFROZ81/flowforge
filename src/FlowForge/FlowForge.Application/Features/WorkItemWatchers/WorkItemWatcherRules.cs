using FlowForge.Application.Common.Exceptions;
using FlowForge.Application.Interfaces;
using FlowForge.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace FlowForge.Application.Features.WorkItemWatchers;

public sealed class WorkItemWatcherRules
{
    private readonly IApplicationDbContext _context;

    public WorkItemWatcherRules(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<WorkItem> GetWorkItemAsync(Guid workItemId, Guid organizationId, CancellationToken cancellationToken)
    {
        var workItem = await _context.WorkItems
            .Include(x => x.Column)
                .ThenInclude(x => x.Board)
                    .ThenInclude(x => x.Project)
            .FirstOrDefaultAsync(
                x =>
                    x.Id == workItemId &&
                    !x.IsDeleted &&
                    x.Column.Board.Project.OrganizationId == organizationId,
                cancellationToken);

        if (workItem is null)
            throw new NotFoundException("Work Item not found.");

        return workItem;
    }

    public async Task<WorkItemWatcher?> GetWatcherAsync(Guid workItemId, Guid userId, CancellationToken cancellationToken)
    {
        return await _context.WorkItemWatchers
            .FirstOrDefaultAsync(
                x =>
                    !x.IsDeleted &&
                    x.WorkItemId == workItemId &&
                    x.UserId == userId,
                cancellationToken);
    }

    public async Task<WorkItemWatcher> GetByIdAsync(Guid watcherId, Guid organizationId, CancellationToken cancellationToken)
    {
        var watcher = await _context.WorkItemWatchers
            .Include(x => x.WorkItem)
                .ThenInclude(x => x.Column)
                    .ThenInclude(x => x.Board)
                        .ThenInclude(x => x.Project)
            .FirstOrDefaultAsync(
                x =>
                    x.Id == watcherId &&
                    !x.IsDeleted &&
                    x.WorkItem.Column.Board.Project.OrganizationId == organizationId,
                cancellationToken);

        if (watcher is null)
            throw new NotFoundException("Watcher not found.");

        return watcher;
    }

    public void EnsureWorkItemNotArchived(WorkItem workItem)
    {
        if (workItem.IsArchived)
            throw new BadRequestException("Archived Work Items cannot be modified.");
    }

    public async Task SaveChangesAsync(CancellationToken cancellationToken)
    {
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task<List<WorkItemWatcher>> GetWatchersAsync(Guid workItemId, CancellationToken cancellationToken)
    {
        return await _context.WorkItemWatchers
            .Where(x =>
                !x.IsDeleted &&
                x.WorkItemId == workItemId)
            .OrderBy(x => x.CreatedAt)
            .ToListAsync(cancellationToken);
    }
}