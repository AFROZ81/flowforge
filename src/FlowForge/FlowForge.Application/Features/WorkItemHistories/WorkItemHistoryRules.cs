using FlowForge.Application.Common.Exceptions;
using FlowForge.Application.Interfaces;
using FlowForge.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace FlowForge.Application.Features.WorkItemHistories;

public sealed class WorkItemHistoryRules
{
    private readonly IApplicationDbContext _context;

    public WorkItemHistoryRules(IApplicationDbContext context)
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
 
    public async Task<List<WorkItemHistory>> GetHistoryAsync(Guid workItemId, CancellationToken cancellationToken)
    {
        return await _context.WorkItemHistories
            .Where(x =>
                !x.IsDeleted &&
                x.WorkItemId == workItemId)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task SaveChangesAsync(CancellationToken cancellationToken)
    {
        await _context.SaveChangesAsync(cancellationToken);
    }
}