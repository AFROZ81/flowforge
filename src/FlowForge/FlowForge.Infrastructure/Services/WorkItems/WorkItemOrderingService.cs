using FlowForge.Application.Common.Constants;
using FlowForge.Application.Interfaces;
using FlowForge.Application.Services.WorkItems;
using Microsoft.EntityFrameworkCore;

namespace FlowForge.Infrastructure.Services.WorkItems;

public sealed class WorkItemOrderingService : IWorkItemOrderingService
{
    private readonly IApplicationDbContext _context;

    public WorkItemOrderingService(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<long> GetNextDisplayOrderAsync(Guid columnId, Guid? excludedWorkItemId, int destinationIndex, CancellationToken cancellationToken)
    {
        var workItems = await _context.WorkItems
            .Where(x =>
                x.ColumnId == columnId &&
                x.Id != excludedWorkItemId &&
                !x.IsDeleted &&
                !x.IsArchived)
            .OrderBy(x => x.DisplayOrder)
            .ToListAsync(cancellationToken);

        destinationIndex = Math.Clamp(destinationIndex, 0, workItems.Count);

        if (workItems.Count == 0)
            return OrderingConstants.Gap;

        // Insert at beginning
        if (destinationIndex <= 0)
        {
            var first = workItems.First();

            if (first.DisplayOrder <= OrderingConstants.Gap)
            {
                await NormalizeColumnAsync(columnId, cancellationToken);

                return await GetNextDisplayOrderAsync(columnId, excludedWorkItemId, destinationIndex, cancellationToken);
            }

            return first.DisplayOrder / 2;
        }

        // Insert at end
        if (destinationIndex >= workItems.Count)
        {
            return workItems.Last().DisplayOrder + OrderingConstants.Gap;
        }

        var previous = workItems[destinationIndex - 1];
        var next = workItems[destinationIndex];

        var gap = next.DisplayOrder - previous.DisplayOrder;

        if (gap > OrderingConstants.MinimumGap)
        {
            return previous.DisplayOrder + (gap / 2);
        }

        await NormalizeColumnAsync(columnId, cancellationToken);

        return await GetNextDisplayOrderAsync(columnId, excludedWorkItemId, destinationIndex, cancellationToken);
    }

    public async Task NormalizeColumnAsync(Guid columnId, CancellationToken cancellationToken)
    {
        var workItems = await _context.WorkItems
            .Where(x =>
                x.ColumnId == columnId &&
                !x.IsDeleted &&
                !x.IsArchived)
            .OrderBy(x => x.DisplayOrder)
            .ToListAsync(cancellationToken);

        long order = OrderingConstants.Gap;

        foreach (var workItem in workItems)
        {
            workItem.Reorder(order);
            order += OrderingConstants.Gap;
        }
    }
}