using FlowForge.Application.Common.Exceptions;
using FlowForge.Application.Interfaces;
using FlowForge.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace FlowForge.Application.Features.Reminders;

public sealed class ReminderRules
{
    private readonly IApplicationDbContext _context;

    public ReminderRules(IApplicationDbContext context)
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

    public void EnsureWorkItemNotArchived(WorkItem workItem)
    {
        if (workItem.IsArchived)
            throw new BadRequestException("Archived Work Items cannot be modified.");
    }

    public void ValidateReminder(
        DateTime? dueDate,
        DateTime? reminderDate)
    {
        if (dueDate.HasValue &&
            reminderDate.HasValue &&
            reminderDate > dueDate)
        {
            throw new BadRequestException("Reminder date cannot be later than the due date.");
        }
    }

    public async Task SaveChangesAsync(CancellationToken cancellationToken)
    {
        await _context.SaveChangesAsync(cancellationToken);
    }
}