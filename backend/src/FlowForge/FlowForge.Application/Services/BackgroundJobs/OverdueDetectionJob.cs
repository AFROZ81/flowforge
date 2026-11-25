using FlowForge.Application.Interfaces;
using FlowForge.Application.Services.Notifications;
using FlowForge.Domain.Common.Enums;
using FlowForge.Domain.Enums;
using FlowForge.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace FlowForge.Application.Services.BackgroundJobs;

/// <summary>
/// Background job for detecting overdue work items.
/// </summary>
public sealed class OverdueDetectionJob
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<OverdueDetectionJob> _logger;

    public OverdueDetectionJob(IServiceScopeFactory scopeFactory, ILogger<OverdueDetectionJob> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    public async Task ExecuteAsync(CancellationToken cancellationToken = default)
    {
        using var scope = _scopeFactory.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<IApplicationDbContext>();
        var notificationService = scope.ServiceProvider.GetRequiredService<INotificationService>();

        var now = DateOnly.FromDateTime(DateTime.UtcNow);

        _logger.LogInformation("Running overdue detection job at {Time}", DateTime.UtcNow);

        // Find work items that are overdue
        var overdueWorkItems = await context.WorkItems
            .AsNoTracking()
            .Where(w =>
                !w.IsDeleted &&
                w.DueDate.HasValue &&
                DateOnly.FromDateTime(w.DueDate.Value) < now &&
                w.Status != WorkItemStatus.Completed &&
                w.Status != WorkItemStatus.Blocked)
            .ToListAsync(cancellationToken);

        foreach (var workItem in overdueWorkItems)
        {
            try
            {
                // Get organization ID through column -> board -> project
                var orgId = await context.WorkItems
                    .AsNoTracking()
                    .Where(w => w.Id == workItem.Id)
                    .Select(w => w.Column.Board.Project.OrganizationId)
                    .FirstOrDefaultAsync(cancellationToken);

                if (orgId == Guid.Empty)
                    continue;

                // Check if already notified for overdue
                var alreadyNotified = await context.Notifications
                    .AsNoTracking()
                    .AnyAsync(n =>
                        n.WorkItemId == workItem.Id &&
                        n.Type == NotificationType.WorkItemStatusChanged &&
                        n.Message.Contains("overdue"),
                        cancellationToken);

                if (alreadyNotified)
                    continue;

                // Notify assignee
                if (workItem.AssigneeId.HasValue)
                {
                    await notificationService.CreateAsync(
                        orgId,
                        workItem.AssigneeId.Value,
                        NotificationType.WorkItemStatusChanged,
                        "Work Item Overdue",
                        $"Work item \"{workItem.Title}\" was due on {workItem.DueDate?.ToString("yyyy-MM-dd") ?? "unknown"} and is now overdue.",
                        workItem.Id,
                        cancellationToken);
                }

                // Notify watchers
                var watchers = await context.WorkItemWatchers
                    .AsNoTracking()
                    .Where(w => w.WorkItemId == workItem.Id && w.UserId != workItem.AssigneeId)
                    .Select(w => w.UserId)
                    .ToListAsync(cancellationToken);

                foreach (var watcherId in watchers)
                {
                    await notificationService.CreateAsync(
                        orgId,
                        watcherId,
                        NotificationType.WorkItemStatusChanged,
                        "Work Item Overdue",
                        $"Watched item \"{workItem.Title}\" is now overdue.",
                        workItem.Id,
                        cancellationToken);
                }

                _logger.LogInformation("Processed overdue notification for work item {WorkItemId}", workItem.Id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to process overdue for work item {WorkItemId}", workItem.Id);
            }
        }

        _logger.LogInformation("Overdue detection job completed. Processed {Count} overdue items.", overdueWorkItems.Count);
    }
}