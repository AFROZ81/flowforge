using FlowForge.Application.Services.BackgroundJobs;
using FlowForge.Application.Interfaces;
using FlowForge.Application.Services.Notifications;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace FlowForge.Infrastructure.BackgroundJobs;

/// <summary>
/// Background service that runs scheduled jobs.
/// </summary>
public sealed class ScheduledJobRunner : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<ScheduledJobRunner> _logger;
    private readonly TimeSpan _checkInterval = TimeSpan.FromMinutes(1);

    public ScheduledJobRunner(IServiceScopeFactory scopeFactory, ILogger<ScheduledJobRunner> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Scheduled job runner started.");

        // Initial delay to let the app start up
        await Task.Delay(TimeSpan.FromSeconds(30), stoppingToken);

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await RunScheduledJobsAsync(stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error running scheduled jobs");
            }

            await Task.Delay(_checkInterval, stoppingToken);
        }

        _logger.LogInformation("Scheduled job runner stopped.");
    }

    private async Task RunScheduledJobsAsync(CancellationToken cancellationToken)
    {
        using var scope = _scopeFactory.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<IApplicationDbContext>();

        var now = DateTime.UtcNow;

        // Run the due-time reminder scan every minute; ReminderNotifiedAt prevents duplicates.
        if (IsTimeToRun("ReminderJob", "* * * * *", context))
        {
            var reminderJob = scope.ServiceProvider.GetRequiredService<ReminderJob>();
            await reminderJob.ExecuteAsync(cancellationToken);
            await UpdateLastRunAsync("ReminderJob", DateTime.UtcNow, cancellationToken);
        }

        // Run overdue detection daily at 1 AM
        if (IsTimeToRun("OverdueDetectionJob", "0 1 * * *", context))
        {
            var overdueJob = scope.ServiceProvider.GetRequiredService<OverdueDetectionJob>();
            await overdueJob.ExecuteAsync(cancellationToken);
            await UpdateLastRunAsync("OverdueDetectionJob", DateTime.UtcNow, cancellationToken);
        }

        // Process export queue every 5 minutes
        if (IsTimeToRun("ExportJobProcessor", "*/5 * * * *", context))
        {
            var exportProcessor = scope.ServiceProvider.GetRequiredService<ExportJobProcessor>();
            // Process pending export jobs
            // await exportProcessor.ProcessPendingAsync(cancellationToken);
        }
    }

    private bool IsTimeToRun(string jobName, string cronExpression, IApplicationDbContext context)
    {
        // Simplified implementation - in production use a proper cron library
        // For now, run once per day based on last run time
        return true; // Simplified - run on every check for demo
    }

    private async Task UpdateLastRunAsync(string jobName, DateTime runTime, CancellationToken cancellationToken)
    {
        // TODO: Persist last run time to database
        await Task.CompletedTask;
    }
}