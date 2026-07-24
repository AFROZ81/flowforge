using FlowForge.Application.Common.Exceptions;
using FlowForge.Application.Features.Columns;
using FlowForge.Application.Interfaces;
using FlowForge.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace FlowForge.Application.Features.WorkItems;

public sealed class WorkItemRules
{
    private readonly IApplicationDbContext _context;
    private readonly ColumnRules _columnRules;

    public WorkItemRules(
        IApplicationDbContext context,
        ColumnRules columnRules)
    {
        _context = context;
        _columnRules = columnRules;
    }

    public async Task<Column> GetColumnAsync(
        Guid columnId,
        Guid organizationId,
        CancellationToken cancellationToken)
    {
        return await _columnRules.GetByIdAsync(
            columnId,
            organizationId,
            cancellationToken);
    }

    public async Task EnsureTitleUniqueAsync(
        Guid columnId,
        string title,
        Guid? ignoreWorkItemId,
        CancellationToken cancellationToken)
    {
        var exists = await _context.WorkItems.AnyAsync(
            x => x.ColumnId == columnId &&
                 x.Title == title &&
                 (!ignoreWorkItemId.HasValue || x.Id != ignoreWorkItemId),
            cancellationToken);

        if (exists)
            throw new BadRequestException(
                "A work item with this title already exists in this column.");
    }

    public async Task<WorkItem> GetByIdAsync(
        Guid workItemId,
        Guid organizationId,
        CancellationToken cancellationToken)
    {
        var workItem = await _context.WorkItems
            .Include(x => x.Column)
                .ThenInclude(x => x.Board)
                    .ThenInclude(x => x.Project)
            .FirstOrDefaultAsync(
                x => x.Id == workItemId &&
                     x.Column.Board.Project.OrganizationId == organizationId,
                cancellationToken);

        if (workItem is null)
            throw new NotFoundException("Work Item not found.");

        return workItem;
    }

    public void EnsureColumnNotArchived(Column column)
    {
        if (column.IsArchived)
            throw new BadRequestException(
                "Cannot manage work items in an archived column.");
    }

    public void EnsureNotArchived(WorkItem workItem)
    {
        if (workItem.IsArchived)
            throw new BadRequestException(
                "Work Item is already archived.");
    }

    public void EnsureArchived(WorkItem workItem)
    {
        if (!workItem.IsArchived)
            throw new BadRequestException(
                "Work Item is not archived.");
    }

    public void EnsureValidDisplayOrder(int displayOrder)
    {
        if (displayOrder <= 0)
            throw new BadRequestException(
                "Display order must be greater than zero.");
    }
}