using FlowForge.Application.Common.Constants;
using FlowForge.Application.Features.Authentication.CurrentUser;
using FlowForge.Application.Interfaces;
using FlowForge.Application.Services;
using FlowForge.Application.Services.Authentication;
using FlowForge.Application.Services.BackgroundJobs;
using FlowForge.Application.Services.Notifications;
using FlowForge.Application.Services.Presence;
using FlowForge.Application.Services.Realtime;
using FlowForge.Application.Services.Users;
using FlowForge.Domain.Common.Enums;
using FlowForge.Domain.Entities;
using FlowForge.Domain.Enums;
using FlowForge.Domain.Events;
using FlowForge.Infrastructure.Identity;
using FlowForge.Infrastructure.Persistence;
using FlowForge.Infrastructure.Services.Notifications;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging.Abstractions;
using Xunit;

namespace FlowForge.Tests;

public sealed class ReminderJobTests
{
    [Fact]
    public async Task ExecuteAsync_PersistsAndBroadcastsDueReminderToAssigneeOnce()
    {
        await using var fixture = await CreateFixtureAsync();
        fixture.WorkItem.AssignTo(fixture.AssigneeId);
        fixture.WorkItem.SetReminder(DateTime.UtcNow.AddMinutes(-1));
        await fixture.Db.SaveChangesAsync();

        using var provider = CreateServiceProvider(
            fixture.Db,
            fixture.Realtime,
            fixture.Email,
            fixture.UserService);
        var job = new ReminderJob(
            provider.GetRequiredService<IServiceScopeFactory>(),
            NullLogger<ReminderJob>.Instance);

        await job.ExecuteAsync();
        await job.ExecuteAsync();

        var notification = Assert.Single(await fixture.Db.Notifications.ToListAsync());
        Assert.Equal(fixture.AssigneeId, notification.RecipientId);
        Assert.Equal(NotificationType.WorkItemReminder, notification.Type);
        Assert.Equal("Work Item Reminder", notification.Title);
        Assert.Contains(fixture.WorkItem.Title, notification.Message);

        var updatedWorkItem = await fixture.Db.WorkItems.SingleAsync(x => x.Id == fixture.WorkItem.Id);
        Assert.NotNull(updatedWorkItem.ReminderNotifiedAt);

        var realtimeEvent = Assert.Single(fixture.Realtime.UserEvents);
        Assert.Equal(fixture.AssigneeId, realtimeEvent.UserId);
        Assert.Equal(RealtimeEvents.NotificationReceived, realtimeEvent.EventName);

        var email = Assert.Single(fixture.Email.Calls);
        Assert.Equal("assignee@test.com", email.To);
        Assert.Equal("Assignee User", email.AssigneeName);
        Assert.Equal(fixture.WorkItem.Title, email.WorkItemTitle);
        Assert.Equal("Test Org", email.OrganizationName);
    }

    [Fact]
    public async Task ExecuteAsync_NotifiesWatchersWithoutDuplicatingAssignee()
    {
        await using var fixture = await CreateFixtureAsync();
        var watcherId = Guid.NewGuid();
        fixture.Db.Users.Add(new ApplicationUser
        {
            Id = watcherId,
            UserName = "watcher@test.com",
            Email = "watcher@test.com",
            FullName = "Watcher User",
            OrganizationId = fixture.OrganizationId,
        });
        fixture.WorkItem.AssignTo(fixture.AssigneeId);
        fixture.WorkItem.SetReminder(DateTime.UtcNow.AddMinutes(-1));
        fixture.Db.WorkItemWatchers.Add(new WorkItemWatcher(fixture.WorkItem.Id, watcherId));
        await fixture.Db.SaveChangesAsync();

        using var provider = CreateServiceProvider(
            fixture.Db,
            fixture.Realtime,
            fixture.Email,
            fixture.UserService);
        var job = new ReminderJob(
            provider.GetRequiredService<IServiceScopeFactory>(),
            NullLogger<ReminderJob>.Instance);

        await job.ExecuteAsync();

        var notifications = await fixture.Db.Notifications.ToListAsync();
        Assert.Equal(2, notifications.Count);
        Assert.Contains(notifications, x => x.RecipientId == fixture.AssigneeId);
        Assert.Contains(notifications, x => x.RecipientId == watcherId);
        Assert.Equal(2, fixture.Realtime.UserEvents.Count);

        var email = Assert.Single(fixture.Email.Calls);
        Assert.Equal("assignee@test.com", email.To);
    }

    [Fact]
    public void SetReminder_ResetsNotifiedMarkerForRescheduledReminder()
    {
        var workItem = new WorkItem(
            Guid.NewGuid(),
            "Reminder reset",
            null,
            WorkItemPriority.Medium,
            null,
            1000);

        workItem.SetReminder(DateTime.UtcNow.AddMinutes(-1));
        workItem.MarkReminderNotified(DateTime.UtcNow);
        Assert.NotNull(workItem.ReminderNotifiedAt);

        workItem.SetReminder(DateTime.UtcNow.AddHours(1));
        Assert.Null(workItem.ReminderNotifiedAt);

        workItem.MarkReminderNotified(DateTime.UtcNow);
        workItem.ClearReminder();
        Assert.Null(workItem.ReminderDate);
        Assert.Null(workItem.ReminderNotifiedAt);
    }

    private static ServiceProvider CreateServiceProvider(
        ApplicationDbContext db,
        FakeRealtimeNotifier realtime,
        FakeEmailService email,
        FakeUserService userService)
    {
        var services = new ServiceCollection();
        services.AddSingleton<IApplicationDbContext>(db);
        services.AddScoped<INotificationService, NotificationService>();
        services.AddScoped<IRealtimeNotifier>(_ => realtime);
        services.AddScoped<IEmailService>(_ => email);
        services.AddScoped<IUserService>(_ => userService);
        return services.BuildServiceProvider();
    }

    private static async Task<Fixture> CreateFixtureAsync()
    {
        var organizationId = Guid.NewGuid();
        var assigneeId = Guid.NewGuid();
        var currentUser = new FakeCurrentUserService
        {
            User = new AuthenticatedUser
            {
                UserId = assigneeId,
                Email = "assignee@test.com",
                FullName = "Assignee User",
                OrganizationId = organizationId,
                OrganizationIds = [organizationId],
                Role = UserRole.Member,
            },
        };

        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        var db = new ApplicationDbContext(options, currentUser, new FakeDomainEventDispatcher());

        db.Organizations.Add(new Organization
        {
            Id = organizationId,
            Name = "Test Org",
            Slug = "test-org",
        });
        db.Users.Add(new ApplicationUser
        {
            Id = assigneeId,
            UserName = "assignee@test.com",
            Email = "assignee@test.com",
            FullName = "Assignee User",
            OrganizationId = organizationId,
            Role = UserRole.Member,
        });
        await db.SaveChangesAsync();

        var project = new Project(organizationId, "Test Project", "TST", null, "#2563EB", null);
        db.Projects.Add(project);
        await db.SaveChangesAsync();

        var board = new Board(project.Id, "Test Board", null);
        db.Boards.Add(board);
        await db.SaveChangesAsync();

        var column = new Column(board.Id, "To Do", null, 1);
        db.Columns.Add(column);
        await db.SaveChangesAsync();

        var workItem = new WorkItem(
            column.Id,
            "Reminder work item",
            null,
            WorkItemPriority.Medium,
            null,
            1000);
        db.WorkItems.Add(workItem);
        await db.SaveChangesAsync();

        return new Fixture
        {
            Db = db,
            WorkItem = workItem,
            OrganizationId = organizationId,
            AssigneeId = assigneeId,
            Realtime = new FakeRealtimeNotifier(),
            Email = new FakeEmailService(),
            UserService = new FakeUserService(new UserInfo
            {
                Id = assigneeId,
                OrganizationId = organizationId,
                FullName = "Assignee User",
                Email = "assignee@test.com",
            }),
        };
    }

    private sealed class Fixture : IAsyncDisposable
    {
        public required ApplicationDbContext Db { get; init; }
        public required WorkItem WorkItem { get; init; }
        public required Guid OrganizationId { get; init; }
        public required Guid AssigneeId { get; init; }
        public required FakeRealtimeNotifier Realtime { get; init; }
        public required FakeEmailService Email { get; init; }
        public required FakeUserService UserService { get; init; }

        public async ValueTask DisposeAsync() => await Db.DisposeAsync();
    }

    private sealed class FakeCurrentUserService : ICurrentUserService
    {
        public AuthenticatedUser User { get; set; } = default!;
        public AuthenticatedUser? TryGetUser() => User;
    }

    private sealed class FakeDomainEventDispatcher : IDomainEventDispatcher
    {
        public Task DispatchAsync<TEvent>(TEvent domainEvent, CancellationToken cancellationToken = default)
            where TEvent : IDomainEvent => Task.CompletedTask;
    }

    private sealed class FakeEmailService : IEmailService
    {
        public EmailSendResult Result { get; set; } = new() { Success = true };
        public List<(string To, string AssigneeName, string WorkItemTitle, string OrganizationName, DateTime ReminderAtUtc)> Calls { get; } = new();

        public Task<EmailSendResult> SendAsync(string to, string subject, string plainTextBody, string htmlBody, CancellationToken cancellationToken = default)
            => Task.FromResult(Result);

        public Task<EmailSendResult> SendInvitationEmailAsync(
            string to,
            string organizationName,
            string invitedByName,
            string role,
            string invitationLink,
            DateTime expiresAt,
            string? message = null,
            CancellationToken cancellationToken = default)
            => Task.FromResult(Result);

        public Task<EmailSendResult> SendWorkItemReminderEmailAsync(
            string to,
            string assigneeName,
            string workItemTitle,
            string organizationName,
            DateTime reminderAtUtc,
            CancellationToken cancellationToken = default)
        {
            Calls.Add((to, assigneeName, workItemTitle, organizationName, reminderAtUtc));
            return Task.FromResult(Result);
        }

        public Task<EmailSendResult> TestSmtpConnectionAsync(CancellationToken cancellationToken = default)
            => Task.FromResult(Result);
    }

    private sealed class FakeUserService : IUserService
    {
        private readonly UserInfo _assignee;

        public FakeUserService(UserInfo assignee)
        {
            _assignee = assignee;
        }

        public Task<UserInfo?> GetByIdAsync(Guid userId, CancellationToken cancellationToken = default)
            => Task.FromResult(userId == _assignee.Id ? _assignee : null);

        public Task<List<UserInfo>> GetByOrganizationAsync(Guid organizationId, CancellationToken cancellationToken = default)
            => Task.FromResult(_assignee.OrganizationId == organizationId
                ? new List<UserInfo> { _assignee }
                : new List<UserInfo>());

        public Task<Dictionary<Guid, UserInfo>> GetDictionaryAsync(IEnumerable<Guid> userIds, CancellationToken cancellationToken = default)
        {
            var ids = userIds.ToHashSet();
            return Task.FromResult(ids.Contains(_assignee.Id)
                ? new Dictionary<Guid, UserInfo> { [_assignee.Id] = _assignee }
                : new Dictionary<Guid, UserInfo>());
        }
    }

    private sealed class FakeRealtimeNotifier : IRealtimeNotifier
    {
        public List<(Guid UserId, string EventName, object Payload)> UserEvents { get; } = new();

        public Task NotifyUserAsync(Guid userId, string eventName, object payload, CancellationToken cancellationToken = default)
        {
            UserEvents.Add((userId, eventName, payload));
            return Task.CompletedTask;
        }

        public Task NotifyOrganizationAsync(Guid organizationId, string eventName, object payload, CancellationToken cancellationToken = default)
            => Task.CompletedTask;

        public Task NotifyUserOnlineAsync(Guid userId, CancellationToken cancellationToken = default)
            => Task.CompletedTask;

        public Task NotifyUserOfflineAsync(Guid userId, CancellationToken cancellationToken = default)
            => Task.CompletedTask;

        public Task NotifyBoardAsync(Guid boardId, string eventName, object payload, CancellationToken cancellationToken = default)
            => Task.CompletedTask;

        public Task NotifyBoardPresenceChangedAsync(Guid boardId, IReadOnlyCollection<BoardViewer> users, CancellationToken cancellationToken = default)
            => Task.CompletedTask;

        public Task NotifyRoleChangedAsync(Guid userId, Guid organizationId, UserRole newRole, CancellationToken cancellationToken = default)
            => Task.CompletedTask;
    }
}
