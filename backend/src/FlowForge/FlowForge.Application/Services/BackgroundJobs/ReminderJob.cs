using FlowForge.Application.Common.Constants;
using FlowForge.Application.Interfaces;
using FlowForge.Application.Services;
using FlowForge.Application.Services.Notifications;
using FlowForge.Application.Services.Realtime;
using FlowForge.Application.Services.Users;
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
        var realtimeNotifier = scope.ServiceProvider.GetRequiredService<IRealtimeNotifier>();
        var emailService = scope.ServiceProvider.GetRequiredService<IEmailService>();
        var userService = scope.ServiceProvider.GetRequiredService<IUserService>();

        var now = DateTime.UtcNow;

        _logger.LogInformation("Running reminder job at {Time}", now);

        // Pick reminders whose exact UTC time has arrived and that have not been sent.
        var workItemsWithReminders = await context.WorkItems
            .Where(w =>
                !w.IsDeleted &&
                !w.IsArchived &&
                w.ReminderDate.HasValue &&
                w.ReminderDate.Value <= now &&
                w.ReminderNotifiedAt == null &&
                w.Status != WorkItemStatus.Completed &&
                w.Status != WorkItemStatus.Blocked)
            .ToListAsync(cancellationToken);

        var processedCount = 0;

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

                var organizationName = await context.Organizations
                    .AsNoTracking()
                    .Where(x => x.Id == orgId)
                    .Select(x => x.Name)
                    .FirstOrDefaultAsync(cancellationToken) ?? "your organization";
                var assignee = workItem.AssigneeId.HasValue
                    ? await userService.GetByIdAsync(workItem.AssigneeId.Value, cancellationToken)
                    : null;

                var notifications = new List<Notification>();

                // The assignee is the primary reminder recipient.
                if (workItem.AssigneeId.HasValue)
                {
                    notifications.Add(await notificationService.CreateAsync(
                        orgId,
                        workItem.AssigneeId.Value,
                        NotificationType.WorkItemReminder,
                        "Work Item Reminder",
                        $"Reminder for \"{workItem.Title}\" is due now.",
                        workItem.Id,
                        cancellationToken));
                }

                // Preserve watcher notifications without duplicating the assignee.
                var watchers = await context.WorkItemWatchers
                    .AsNoTracking()
                    .Where(w => w.WorkItemId == workItem.Id && w.UserId != workItem.AssigneeId)
                    .Select(w => w.UserId)
                    .ToListAsync(cancellationToken);

                foreach (var watcherId in watchers)
                {
                    notifications.Add(await notificationService.CreateAsync(
                        orgId,
                        watcherId,
                        NotificationType.WorkItemReminder,
                        "Work Item Reminder",
                        $"Reminder for watched item \"{workItem.Title}\" is due now.",
                        workItem.Id,
                        cancellationToken));
                }

                // Persist the notifications and the once-only marker together.
                workItem.MarkReminderNotified(now);
                await context.SaveChangesAsync(cancellationToken);

                foreach (var notification in notifications)
                {
                    try
                    {
                        await realtimeNotifier.NotifyUserAsync(
                            notification.RecipientId,
                            RealtimeEvents.NotificationReceived,
                            new
                            {
                                notification.Id,
                                notification.Title,
                                notification.Message,
                                notification.Type,
                                notification.CreatedAt,
                                notification.WorkItemId
                            },
                            cancellationToken);
                    }
                    catch (Exception ex)
                    {
                        // The persisted notification remains available after a refresh.
                        _logger.LogWarning(ex, "Failed to broadcast reminder notification {NotificationId}", notification.Id);
                    }
                }

                if (assignee is not null && !string.IsNullOrWhiteSpace(assignee.Email))
                {
                    try
                    {
                        var emailResult = await emailService.SendWorkItemReminderEmailAsync(
                            assignee.Email,
                            assignee.FullName,
                            workItem.Title,
                            organizationName,
                            workItem.ReminderDate!.Value,
                            cancellationToken);

                        if (!emailResult.Success)
                        {
                            _logger.LogWarning(
                                "Reminder email was not accepted for work item {WorkItemId}: {ErrorCode}",
                                workItem.Id,
                                emailResult.ErrorCode ?? "unknown");
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "Failed to send reminder email for work item {WorkItemId}", workItem.Id);
                    }
                }

                processedCount++;
                _logger.LogInformation("Processed reminder for work item {WorkItemId}", workItem.Id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to process reminder for work item {WorkItemId}", workItem.Id);
            }
        }

        _logger.LogInformation("Reminder job completed. Processed {Count} reminders.", processedCount);
    }
}