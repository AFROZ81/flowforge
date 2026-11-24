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
/// Background job for processing work item reminders.
/// </summary>
public sealed class ReminderJob
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<ReminderJob> _logger;

    public ReminderJob(IServiceScopeFactory scopeFactory, ILogger<ReminderJob> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    public async Task ExecuteAsync(CancellationToken cancellationToken = default)
    {
        using var scope = _scopeFactory.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<IApplicationDbContext>();
        var notificationService = scope.ServiceProvider.GetRequiredService<INotificationService>();

        var now = DateTime.UtcNow;
        var today = DateOnly.FromDateTime(now);

        _logger.LogInformation("Running reminder job at {Time}", now);

        // Find work items with reminders due today
        var workItemsWithReminders = await context.WorkItems
            .AsNoTracking()
            .Where(w =>
                !w.IsDeleted &&
                w.ReminderDate.HasValue &&
                DateOnly.FromDateTime(w.ReminderDate.Value) == today &&
                w.Status != WorkItemStatus.Completed &&
                w.Status != WorkItemStatus.Blocked)
            .ToListAsync(cancellationToken);

        foreach (var workItem in workItemsWithReminders)
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

                // Create reminder notification for assignee
                if (workItem.AssigneeId.HasValue)
                {
                    await notificationService.CreateAsync(
                        orgId,
                        workItem.AssigneeId.Value,
                        NotificationType.WorkItemStatusChanged,
                        "Work Item Reminder",
                        $"Reminder for \"{workItem.Title}\" is due today.",
                        workItem.Id,
                        cancellationToken);
                }

                // Also notify watchers
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
                        "Work Item Reminder",
                        $"Reminder for watched item \"{workItem.Title}\" is due today.",
                        workItem.Id,
                        cancellationToken);
                }

                _logger.LogInformation("Processed reminder for work item {WorkItemId}", workItem.Id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to process reminder for work item {WorkItemId}", workItem.Id);
            }
        }

        _logger.LogInformation("Reminder job completed. Processed {Count} reminders.", workItemsWithReminders.Count);
    }
}