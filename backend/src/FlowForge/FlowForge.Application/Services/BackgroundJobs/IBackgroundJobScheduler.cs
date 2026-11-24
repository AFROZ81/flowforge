using System.Linq.Expressions;

namespace FlowForge.Application.Services.BackgroundJobs;

/// <summary>
/// Interface for scheduling background jobs.
/// </summary>
public interface IBackgroundJobScheduler
{
    /// <summary>
    /// Enqueues a fire-and-forget background job.
    /// </summary>
    Task EnqueueAsync<TJob>(Expression<Func<TJob, Task>> methodCall, CancellationToken cancellationToken = default)
        where TJob : class;

    /// <summary>
    /// Schedules a job to run after a delay.
    /// </summary>
    Task ScheduleAsync<TJob>(Expression<Func<TJob, Task>> methodCall, TimeSpan delay, CancellationToken cancellationToken = default)
        where TJob : class;

    /// <summary>
    /// Schedules a recurring job.
    /// </summary>
    Task ScheduleRecurringAsync<TJob>(Expression<Func<TJob, Task>> methodCall, CronExpression cron, CancellationToken cancellationToken = default)
        where TJob : class;

    /// <summary>
    /// Deletes a recurring job.
    /// </summary>
    Task DeleteRecurringAsync(string jobId, CancellationToken cancellationToken = default);
}

/// <summary>
/// Cron expression representation.
/// </summary>
public sealed record CronExpression(string Expression)
{
    public static CronExpression Daily(int hour = 0, int minute = 0)
    {
        return new CronExpression($"{minute} {hour} * * *");
    }

    public static CronExpression Hourly(int minute = 0)
    {
        return new CronExpression($"{minute} * * * *");
    }
}