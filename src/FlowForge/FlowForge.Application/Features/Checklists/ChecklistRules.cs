using FlowForge.Application.Common.Exceptions;
using FlowForge.Application.Interfaces;
using FlowForge.Domain.Entities;
using FlowForge.Application.Features.Checklists.Progress;
using Microsoft.EntityFrameworkCore;

namespace FlowForge.Application.Features.Checklists;

public sealed class ChecklistRules
{
    private readonly IApplicationDbContext _context;

    public ChecklistRules(IApplicationDbContext context)
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

    public async Task<ChecklistItem> GetChecklistItemAsync(Guid checklistItemId, Guid organizationId, CancellationToken cancellationToken)
    {
        var item = await _context.ChecklistItems
            .Include(x => x.WorkItem)
                .ThenInclude(x => x.Column)
                    .ThenInclude(x => x.Board)
                        .ThenInclude(x => x.Project)
            .FirstOrDefaultAsync(
                x =>
                    x.Id == checklistItemId &&
                    !x.IsDeleted &&
                    x.WorkItem.Column.Board.Project.OrganizationId == organizationId,
                cancellationToken);

        if (item is null)
            throw new NotFoundException("Checklist item not found.");

        return item;
    }

    public void EnsureWorkItemNotArchived(WorkItem workItem)
    {
        if (workItem.IsArchived)
            throw new BadRequestException("Archived Work Items cannot be modified.");
    }

    public async Task<int> GetNextOrderAsync(Guid workItemId, CancellationToken cancellationToken)
    {
        var maxOrder = await _context.ChecklistItems
            .Where(x =>
                !x.IsDeleted &&
                x.WorkItemId == workItemId)
            .MaxAsync(
                x => (int?)x.Order,
                cancellationToken);

        return (maxOrder ?? -1) + 1;
    }

    public async Task<List<ChecklistItem>> GetChecklistAsync(Guid workItemId, CancellationToken cancellationToken)
    {
        return await _context.ChecklistItems
            .Where(x =>
                !x.IsDeleted &&
                x.WorkItemId == workItemId)
            .OrderBy(x => x.Order)
            .ToListAsync(cancellationToken);
    }

    public async Task SaveChangesAsync(CancellationToken cancellationToken)
    {
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task<GetChecklistProgressResponse> GetProgressAsync(Guid workItemId, CancellationToken cancellationToken)
    {
        var total = await _context.ChecklistItems
            .CountAsync(x =>
                !x.IsDeleted &&
                x.WorkItemId == workItemId,
                cancellationToken);

        var completed = await _context.ChecklistItems
            .CountAsync(x =>
                !x.IsDeleted &&
                x.WorkItemId == workItemId &&
                x.IsCompleted,
                cancellationToken);

        var percentage = total == 0
            ? 0
            : (int)Math.Round(completed * 100.0 / total);

        return new GetChecklistProgressResponse
        {
            TotalItems = total,
            CompletedItems = completed,
            ProgressPercentage = percentage
        };
    }
}