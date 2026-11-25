using FlowForge.Application.Common.Exceptions;
using FlowForge.Application.Features.Authentication.CurrentUser;
using FlowForge.Application.Features.Authentication.Login;
using FlowForge.Application.Features.Authentication.Register;
using FlowForge.Application.Features.Organizations.Invitations.Accept;
using FlowForge.Application.Features.Organizations.Invitations.Create;
using FlowForge.Application.Features.Organizations.Invitations.Resend;
using FlowForge.Application.Features.AuditLogs.GetAuditLogs;
using FlowForge.Application.Interfaces;
using FlowForge.Application.Services;
using FlowForge.Application.Services.Authentication;
using FlowForge.Application.Services.AuditLogs;
using FlowForge.Domain.Entities;
using FlowForge.Domain.Enums;
using FlowForge.Domain.Events;
using FlowForge.Infrastructure.Identity;
using FlowForge.Infrastructure.Persistence;
using FlowForge.Infrastructure.Services.Authentication;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;
using Xunit;

namespace FlowForge.Tests;

/// <summary>
/// Tests for invitation email handling using an in-memory database and a fake
/// email service. No real SMTP server is used and no real email is sent.
/// </summary>
public sealed class InvitationEmailHandlerTests
{
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

    private sealed class FakeUserLookupService : IUserLookupService
    {
        public UserLookupResult? ByEmail { get; set; }
        public UserLookupResult? ById { get; set; }
        public ApplicationDbContext? Db { get; set; }

        public async Task<UserLookupResult?> FindByEmailAsync(string email, CancellationToken cancellationToken = default)
        {
            if (Db is not null)
            {
                var user = await Db.Users.FirstOrDefaultAsync(
                    u => u.NormalizedEmail == email.Trim().ToUpperInvariant(),
                    cancellationToken);

                return user is null ? null : new UserLookupResult
                {
                    Id = user.Id,
                    Email = user.Email!,
                    FullName = user.FullName,
                };
            }

            return ByEmail;
        }

        public async Task<UserLookupResult?> FindByIdAsync(Guid userId, CancellationToken cancellationToken = default)
        {
            if (Db is not null)
            {
                var user = await Db.Users.FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);

                return user is null ? null : new UserLookupResult
                {
                    Id = user.Id,
                    Email = user.Email!,
                    FullName = user.FullName,
                };
            }

            return ById;
        }
    }

    private sealed class FakeAuditLogService : IAuditLogService
    {
        public List<AuditLogEntry> Entries { get; } = new();

        public Task CreateAsync(AuditLogEntry entry, CancellationToken cancellationToken = default)
        {
            Entries.Add(entry);
            return Task.CompletedTask;
        }

        public Task<PagedResult<GetAuditLogsResponse>> GetAsync(GetAuditLogsRequest request, CancellationToken cancellationToken = default)
            => throw new NotImplementedException();

        public Task<AuditLogStatistics> GetStatisticsAsync(Guid organizationId, CancellationToken cancellationToken = default)
            => throw new NotImplementedException();
    }

    private sealed class FakeEmailService : IEmailService
    {
        public EmailSendResult Result { get; set; } = new() { Success = true };
        public List<(string To, string Org, string Role, string Link)> Calls { get; } = new();

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
        {
            Calls.Add((to, organizationName, role, invitationLink));
            return Task.FromResult(Result);
        }

        public Task<EmailSendResult> TestSmtpConnectionAsync(CancellationToken cancellationToken = default)
            => Task.FromResult(Result);
    }

    private sealed class FakeTokenService : ITokenService
    {
        public TokenResult GenerateAccessToken(AuthenticatedUser user) => new()
        {
            AccessToken = "invitation-session-token",
            ExpiresAtUtc = DateTime.UtcNow.AddHours(1),
        };
    }

    private sealed class FakeMediator : IMediator
    {
        private readonly AcceptInvitationCommandHandler _handler;

        public FakeMediator(
            ApplicationDbContext context,
            IUserLookupService userLookup,
            ITokenService tokenService,
            IAuditLogService auditLogService)
        {
            _handler = new AcceptInvitationCommandHandler(
                context,
                userLookup,
                tokenService,
                auditLogService);
        }

        public async Task<TResponse> Send<TResponse>(
            IRequest<TResponse> request,
            CancellationToken cancellationToken = default)
        {
            if (request is AcceptInvitationCommand command)
            {
                return (TResponse)(object)await _handler.Handle(command, cancellationToken);
            }

            throw new NotSupportedException();
        }

        public Task Send<TRequest>(
            TRequest request,
            CancellationToken cancellationToken = default)
            where TRequest : IRequest => Task.CompletedTask;

        public async Task<object?> Send(
            object request,
            CancellationToken cancellationToken = default)
        {
            if (request is AcceptInvitationCommand command)
            {
                return await _handler.Handle(command, cancellationToken);
            }

            throw new NotSupportedException();
        }

        public IAsyncEnumerable<TResponse> CreateStream<TResponse>(
            IStreamRequest<TResponse> request,
            CancellationToken cancellationToken = default)
            => throw new NotSupportedException();

        public IAsyncEnumerable<object?> CreateStream(
            object request,
            CancellationToken cancellationToken = default)
            => throw new NotSupportedException();

        public Task Publish<TNotification>(
            TNotification notification,
            CancellationToken cancellationToken = default)
            where TNotification : INotification => Task.CompletedTask;

        public Task Publish(object notification, CancellationToken cancellationToken = default)
            => Task.CompletedTask;
    }

    private sealed class TestContext
    {
        public ApplicationDbContext Db { get; }
        public UserManager<ApplicationUser> UserManager { get; }
        public FakeCurrentUserService CurrentUser { get; } = new();
        public FakeUserLookupService UserLookup { get; } = new();
        public FakeAuditLogService AuditLog { get; } = new();
        public FakeEmailService Email { get; } = new();
        public Guid OrganizationId { get; }
        public Guid AdminUserId { get; }

        public TestContext(string databaseName)
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName)
                .Options;

            Db = new ApplicationDbContext(options, CurrentUser, new FakeDomainEventDispatcher());

            var userStore = new UserStore<
                ApplicationUser,
                IdentityRole<Guid>,
                ApplicationDbContext,
                Guid,
                IdentityUserClaim<Guid>,
                IdentityUserRole<Guid>,
                IdentityUserLogin<Guid>,
                IdentityUserToken<Guid>,
                IdentityRoleClaim<Guid>>(Db);

            UserManager = new UserManager<ApplicationUser>(
                userStore,
                Options.Create(new IdentityOptions()),
                new PasswordHasher<ApplicationUser>(),
                Array.Empty<IUserValidator<ApplicationUser>>(),
                Array.Empty<IPasswordValidator<ApplicationUser>>(),
                new UpperInvariantLookupNormalizer(),
                new IdentityErrorDescriber(),
                null!,
                NullLogger<UserManager<ApplicationUser>>.Instance);

            AdminUserId = Guid.NewGuid();
            OrganizationId = Guid.NewGuid();

            // Seed the admin user (Identity) and their organization membership.
            Db.Users.Add(new ApplicationUser
            {
                Id = AdminUserId,
                Email = "admin@example.com",
                NormalizedEmail = "ADMIN@EXAMPLE.COM",
                UserName = "admin@example.com",
                NormalizedUserName = "ADMIN@EXAMPLE.COM",
                EmailConfirmed = true,
            });

            Db.Organizations.Add(new Organization
            {
                Id = OrganizationId,
                Name = "Acme Corp",
                Slug = "acme-corp",
            });

            Db.OrganizationUsers.Add(new OrganizationUser
            {
                Id = Guid.NewGuid(),
                UserId = AdminUserId,
                OrganizationId = OrganizationId,
                Role = UserRole.Admin,
            });

            Db.SaveChanges();

            CurrentUser.User = new AuthenticatedUser
            {
                UserId = AdminUserId,
                Email = "admin@example.com",
                FullName = "Admin User",
                OrganizationId = OrganizationId,
                OrganizationIds = new List<Guid> { OrganizationId },
                Role = UserRole.Admin,
            };

            // The invitee does not exist yet.
            UserLookup.ByEmail = null;
            UserLookup.ById = new UserLookupResult
            {
                Id = AdminUserId,
                Email = "admin@example.com",
                FullName = "Admin User",
            };
        }
    }

    private static CreateInvitationCommand Command(string email, Guid orgId) =>
        new()
        {
            Email = email,
            Role = UserRole.Member,
            OrganizationId = orgId,
        };

    private static RegisterRequest InvitationRegistration(string email, string token) => new()
    {
        FullName = "Invited User",
        Email = email,
        Password = "Password123",
        ConfirmPassword = "Password123",
        InvitationToken = token,
    };

    [Fact]
    public async Task Create_invitation_when_email_sent_marks_status_sent_and_returns_response()
    {
        var ctx = new TestContext("invitation-email-sent");

        var handler = new CreateInvitationCommandHandler(
            ctx.Db,
            ctx.CurrentUser,
            ctx.Email,
            ctx.UserLookup,
            ctx.AuditLog,
            new ConfigurationBuilder().Build(),
            NullLogger<CreateInvitationCommandHandler>.Instance);

        var result = await handler.Handle(Command("invitee@example.com", ctx.OrganizationId), CancellationToken.None);

        Assert.Equal("invitee@example.com", result.Email);
        Assert.Equal(EmailSendStatus.Sent, result.EmailStatus);
        Assert.Null(result.EmailError);

        // Invitation record persisted with email status.
        var invite = await ctx.Db.OrganizationInvitations
            .FirstAsync(i => i.Email == "invitee@example.com");

        Assert.Equal(EmailSendStatus.Sent, invite.EmailStatus);
        Assert.Null(invite.EmailError);
        Assert.Equal(1, invite.EmailAttempts);

        // Email service was called with the correct link shape.
        Assert.Single(ctx.Email.Calls);
        Assert.StartsWith("https://flowforge-app.runasp.net/accept-invitation?token=", ctx.Email.Calls[0].Link);
        Assert.DoesNotContain("token=", ctx.Email.Calls[0].To);
    }

    [Fact]
    public async Task Create_invitation_when_email_fails_preserves_invitation_and_marks_failed()
    {
        var ctx = new TestContext("invitation-email-fails");
        ctx.Email.Result = new EmailSendResult
        {
            Success = false,
            Error = "SMTP connection refused.",
            ErrorCode = "smtp_error",
        };

        var handler = new CreateInvitationCommandHandler(
            ctx.Db,
            ctx.CurrentUser,
            ctx.Email,
            ctx.UserLookup,
            ctx.AuditLog,
            new ConfigurationBuilder().Build(),
            NullLogger<CreateInvitationCommandHandler>.Instance);

        var result = await handler.Handle(Command("invitee@example.com", ctx.OrganizationId), CancellationToken.None);

        // The invitation is created even though delivery failed.
        Assert.Equal(EmailSendStatus.Failed, result.EmailStatus);
        Assert.Equal(
            "Invitation created, but the invitation email could not be delivered. Use resend to retry.",
            result.EmailError);

        var invite = await ctx.Db.OrganizationInvitations
            .FirstAsync(i => i.Email == "invitee@example.com");

        Assert.Equal(EmailSendStatus.Failed, invite.EmailStatus);
        Assert.Equal("SMTP connection refused.", invite.EmailError);
        Assert.Equal(1, invite.EmailAttempts);
        Assert.NotNull(invite.LastEmailSendAt);
        Assert.False(invite.IsAccepted);
    }

    [Fact]
    public async Task Create_duplicate_pending_invitation_returns_conflict()
    {
        var ctx = new TestContext("invitation-duplicate");

        var handler = new CreateInvitationCommandHandler(
            ctx.Db,
            ctx.CurrentUser,
            ctx.Email,
            ctx.UserLookup,
            ctx.AuditLog,
            new ConfigurationBuilder().Build(),
            NullLogger<CreateInvitationCommandHandler>.Instance);

        await handler.Handle(Command("invitee@example.com", ctx.OrganizationId), CancellationToken.None);

        var ex = await Assert.ThrowsAsync<ConflictException>(() =>
            handler.Handle(Command("invitee@example.com", ctx.OrganizationId), CancellationToken.None));

        Assert.Contains("already exists", ex.Message);
    }

    [Fact]
    public async Task Create_rate_limit_exceeded_returns_conflict()
    {
        var ctx = new TestContext("invitation-rate-limit");

        var handler = new CreateInvitationCommandHandler(
            ctx.Db,
            ctx.CurrentUser,
            ctx.Email,
            ctx.UserLookup,
            ctx.AuditLog,
            new ConfigurationBuilder().Build(),
            NullLogger<CreateInvitationCommandHandler>.Instance);

        // Seed the maximum number of invitations within the last hour. The
        // handler enforces MaxInvitationsPerAdminPerHour (= 10).
        for (var i = 0; i < 10; i++)
        {
            await handler.Handle(Command($"existing{i}@example.com", ctx.OrganizationId), CancellationToken.None);
        }

        // The next invitation should be rate limited.
        var ex = await Assert.ThrowsAsync<ConflictException>(() =>
            handler.Handle(Command("rate-limited@example.com", ctx.OrganizationId), CancellationToken.None));

        Assert.Contains("rate limit", ex.Message, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task Create_invitation_email_url_uses_localhost_when_configured()
    {
        var ctx = new TestContext("invitation-url");

        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Frontend:BaseUrl"] = "http://localhost:5173/",
            })
            .Build();

        var handler = new CreateInvitationCommandHandler(
            ctx.Db,
            ctx.CurrentUser,
            ctx.Email,
            ctx.UserLookup,
            ctx.AuditLog,
            config,
            NullLogger<CreateInvitationCommandHandler>.Instance);

        await handler.Handle(Command("invitee@example.com", ctx.OrganizationId), CancellationToken.None);

        Assert.Single(ctx.Email.Calls);
        Assert.StartsWith("http://localhost:5173/accept-invitation?token=", ctx.Email.Calls[0].Link);
    }

    [Fact]
    public async Task Resend_invitation_email_url_uses_production_domain_by_default()
    {
        var ctx = new TestContext("invitation-resend-url");
        var invitation = new OrganizationInvitation
        {
            Id = Guid.NewGuid(),
            Email = "invitee@example.com",
            Role = UserRole.Member,
            Token = "resend-token",
            ExpiresAt = DateTime.UtcNow.AddDays(7),
            OrganizationId = ctx.OrganizationId,
            InvitedByUserId = ctx.AdminUserId,
            EmailStatus = EmailSendStatus.Sent,
        };
        ctx.Db.OrganizationInvitations.Add(invitation);
        await ctx.Db.SaveChangesAsync();

        var handler = new ResendInvitationCommandHandler(
            ctx.Db,
            ctx.CurrentUser,
            ctx.Email,
            ctx.UserLookup,
            new ConfigurationBuilder().Build());

        await handler.Handle(new ResendInvitationCommand { Id = invitation.Id }, CancellationToken.None);

        Assert.Single(ctx.Email.Calls);
        Assert.StartsWith("https://flowforge-app.runasp.net/accept-invitation?token=", ctx.Email.Calls[0].Link);
    }

    [Fact]
    public async Task Expired_invitation_does_not_block_new_invitation()
    {
        var ctx = new TestContext("invitation-expired");

        var handler = new CreateInvitationCommandHandler(
            ctx.Db,
            ctx.CurrentUser,
            ctx.Email,
            ctx.UserLookup,
            ctx.AuditLog,
            new ConfigurationBuilder().Build(),
            NullLogger<CreateInvitationCommandHandler>.Instance);

        // Create an expired invitation.
        ctx.Db.OrganizationInvitations.Add(new OrganizationInvitation
        {
            Id = Guid.NewGuid(),
            Email = "invitee@example.com",
            Role = UserRole.Member,
            Token = "expired-token",
            ExpiresAt = DateTime.UtcNow.AddDays(-1), // already expired
            OrganizationId = ctx.OrganizationId,
            InvitedByUserId = ctx.AdminUserId,
            EmailStatus = EmailSendStatus.Sent,
        });
        await ctx.Db.SaveChangesAsync();

        // Creating a new invitation for the same email should succeed.
        var result = await handler.Handle(
            Command("invitee@example.com", ctx.OrganizationId),
            CancellationToken.None);

        Assert.Equal(EmailSendStatus.Sent, result.EmailStatus);
        Assert.Null(result.EmailError);

        // There should now be two invitation records (expired + new).
        var count = await ctx.Db.OrganizationInvitations
            .CountAsync(i => i.Email == "invitee@example.com");
        Assert.Equal(2, count);
    }

    [Fact]
    public async Task Accepted_invitation_does_not_block_new_invitation()
    {
        var ctx = new TestContext("invitation-accepted");

        var handler = new CreateInvitationCommandHandler(
            ctx.Db,
            ctx.CurrentUser,
            ctx.Email,
            ctx.UserLookup,
            ctx.AuditLog,
            new ConfigurationBuilder().Build(),
            NullLogger<CreateInvitationCommandHandler>.Instance);

        // Create an accepted invitation.
        ctx.Db.OrganizationInvitations.Add(new OrganizationInvitation
        {
            Id = Guid.NewGuid(),
            Email = "invitee@example.com",
            Role = UserRole.Member,
            Token = "accepted-token",
            ExpiresAt = DateTime.UtcNow.AddDays(7),
            OrganizationId = ctx.OrganizationId,
            InvitedByUserId = ctx.AdminUserId,
            IsAccepted = true,
            AcceptedAt = DateTime.UtcNow,
            EmailStatus = EmailSendStatus.Sent,
        });
        await ctx.Db.SaveChangesAsync();

        // Creating a new invitation for the same email should succeed.
        var result = await handler.Handle(
            Command("invitee@example.com", ctx.OrganizationId),
            CancellationToken.None);

        Assert.Equal(EmailSendStatus.Sent, result.EmailStatus);
        Assert.Null(result.EmailError);
    }

    [Fact]
    public async Task Revoked_deleted_invitation_does_not_block_new_invitation()
    {
        var ctx = new TestContext("invitation-revoked");

        var handler = new CreateInvitationCommandHandler(
            ctx.Db,
            ctx.CurrentUser,
            ctx.Email,
            ctx.UserLookup,
            ctx.AuditLog,
            new ConfigurationBuilder().Build(),
            NullLogger<CreateInvitationCommandHandler>.Instance);

        // Create a revoked (soft-deleted) invitation that hasn't expired yet.
        // This is the bug scenario: previously this blocked creation (409) but
        // didn't appear in the UI because the list filters IsDeleted.
        // Note: SaveChangesAsync forces IsDeleted=false on Added entities, so
        // we simulate the real revoke flow: create, then set IsDeleted=true and
        // save again (Modified state preserves the flag).
        var revokedInvite = new OrganizationInvitation
        {
            Id = Guid.NewGuid(),
            Email = "invitee@example.com",
            Role = UserRole.Member,
            Token = "revoked-token",
            ExpiresAt = DateTime.UtcNow.AddDays(7),
            OrganizationId = ctx.OrganizationId,
            InvitedByUserId = ctx.AdminUserId,
            EmailStatus = EmailSendStatus.Sent,
        };
        ctx.Db.OrganizationInvitations.Add(revokedInvite);
        await ctx.Db.SaveChangesAsync();

        revokedInvite.IsDeleted = true;
        await ctx.Db.SaveChangesAsync();

        // Creating a new invitation for the same email should succeed.
        var result = await handler.Handle(
            Command("invitee@example.com", ctx.OrganizationId),
            CancellationToken.None);

        Assert.Equal(EmailSendStatus.Sent, result.EmailStatus);
        Assert.Null(result.EmailError);

        // The new invitation should exist alongside the soft-deleted one.
        var activeInvites = await ctx.Db.OrganizationInvitations
            .CountAsync(i => i.Email == "invitee@example.com" && !i.IsDeleted);
        Assert.Equal(1, activeInvites);
    }

    [Fact]
    public async Task Case_insensitive_email_matching_blocks_duplicate()
    {
        var ctx = new TestContext("invitation-case");

        var handler = new CreateInvitationCommandHandler(
            ctx.Db,
            ctx.CurrentUser,
            ctx.Email,
            ctx.UserLookup,
            ctx.AuditLog,
            new ConfigurationBuilder().Build(),
            NullLogger<CreateInvitationCommandHandler>.Instance);

        // Create a pending invitation with mixed-case email.
        ctx.Db.OrganizationInvitations.Add(new OrganizationInvitation
        {
            Id = Guid.NewGuid(),
            Email = "  Invitee@Example.Com  ",
            Role = UserRole.Member,
            Token = "case-token",
            ExpiresAt = DateTime.UtcNow.AddDays(7),
            OrganizationId = ctx.OrganizationId,
            InvitedByUserId = ctx.AdminUserId,
            EmailStatus = EmailSendStatus.NotSent,
        });
        await ctx.Db.SaveChangesAsync();

        // Inviting with a differently-cased email should be blocked.
        var ex = await Assert.ThrowsAsync<ConflictException>(() =>
            handler.Handle(
                Command("invitee@example.com", ctx.OrganizationId),
                CancellationToken.None));

        Assert.Contains("already exists", ex.Message);
    }

    [Fact]
    public async Task Invitation_from_other_organization_does_not_block()
    {
        var ctx = new TestContext("invitation-other-org");

        var handler = new CreateInvitationCommandHandler(
            ctx.Db,
            ctx.CurrentUser,
            ctx.Email,
            ctx.UserLookup,
            ctx.AuditLog,
            new ConfigurationBuilder().Build(),
            NullLogger<CreateInvitationCommandHandler>.Instance);

        // Create a pending invitation in a different organization.
        var otherOrgId = Guid.NewGuid();
        ctx.Db.Organizations.Add(new Organization
        {
            Id = otherOrgId,
            Name = "Other Corp",
            Slug = "other-corp",
        });
        ctx.Db.OrganizationInvitations.Add(new OrganizationInvitation
        {
            Id = Guid.NewGuid(),
            Email = "invitee@example.com",
            Role = UserRole.Member,
            Token = "other-org-token",
            ExpiresAt = DateTime.UtcNow.AddDays(7),
            OrganizationId = otherOrgId,
            InvitedByUserId = ctx.AdminUserId,
            EmailStatus = EmailSendStatus.NotSent,
        });
        await ctx.Db.SaveChangesAsync();

        // Creating an invitation in our organization should succeed.
        var result = await handler.Handle(
            Command("invitee@example.com", ctx.OrganizationId),
            CancellationToken.None);

        Assert.Equal(EmailSendStatus.Sent, result.EmailStatus);
        Assert.Null(result.EmailError);
    }

    [Fact]
    public async Task Create_trims_whitespace_from_email()
    {
        var ctx = new TestContext("invitation-trim");

        var handler = new CreateInvitationCommandHandler(
            ctx.Db,
            ctx.CurrentUser,
            ctx.Email,
            ctx.UserLookup,
            ctx.AuditLog,
            new ConfigurationBuilder().Build(),
            NullLogger<CreateInvitationCommandHandler>.Instance);

        var result = await handler.Handle(
            Command("  Invitee@Example.Com  ", ctx.OrganizationId),
            CancellationToken.None);

        Assert.Equal(EmailSendStatus.Sent, result.EmailStatus);

        // The stored email should be trimmed and lowercased.
        var invite = await ctx.Db.OrganizationInvitations
            .FirstAsync(i => i.Id == result.Id);
        Assert.Equal("invitee@example.com", invite.Email);
    }

    [Fact]
    public async Task Invitation_registration_accepts_invitation_and_returns_session()
    {
        var ctx = new TestContext("invitation-registration-accept");
        ctx.UserLookup.Db = ctx.Db;

        ctx.Db.OrganizationInvitations.Add(new OrganizationInvitation
        {
            Id = Guid.NewGuid(),
            Email = "invitee@example.com",
            Role = UserRole.Viewer,
            Token = "registration-invitation-token",
            ExpiresAt = DateTime.UtcNow.AddDays(7),
            OrganizationId = ctx.OrganizationId,
            InvitedByUserId = ctx.AdminUserId,
            EmailStatus = EmailSendStatus.Sent,
        });
        await ctx.Db.SaveChangesAsync();

        var tokenService = new FakeTokenService();
        var mediator = new FakeMediator(ctx.Db, ctx.UserLookup, tokenService, ctx.AuditLog);
        var service = new AuthService(ctx.UserManager, ctx.Db, tokenService, mediator);

        var result = await service.RegisterAsync(
            InvitationRegistration("invitee@example.com", "registration-invitation-token"),
            CancellationToken.None);

        Assert.Equal("invitation-session-token", result.AccessToken);
        Assert.NotNull(result.ExpiresAtUtc);
        Assert.NotNull(await ctx.UserManager.FindByEmailAsync("invitee@example.com"));

        var membership = await ctx.Db.OrganizationUsers.FirstAsync(
            ou => ou.UserId == result.UserId && ou.OrganizationId == ctx.OrganizationId);
        Assert.Equal(UserRole.Viewer, membership.Role);

        var invitation = await ctx.Db.OrganizationInvitations.FirstAsync(
            i => i.Token == "registration-invitation-token");
        Assert.True(invitation.IsAccepted);
        Assert.Equal(result.UserId, invitation.AcceptedByUserId);
        Assert.Single(ctx.AuditLog.Entries);
    }

    [Fact]
    public async Task Invitation_registration_rejects_mismatched_email_before_creating_user()
    {
        var ctx = new TestContext("invitation-registration-email-mismatch");

        ctx.Db.OrganizationInvitations.Add(new OrganizationInvitation
        {
            Id = Guid.NewGuid(),
            Email = "invitee@example.com",
            Role = UserRole.Member,
            Token = "mismatch-invitation-token",
            ExpiresAt = DateTime.UtcNow.AddDays(7),
            OrganizationId = ctx.OrganizationId,
            InvitedByUserId = ctx.AdminUserId,
            EmailStatus = EmailSendStatus.Sent,
        });
        await ctx.Db.SaveChangesAsync();

        var tokenService = new FakeTokenService();
        var mediator = new FakeMediator(ctx.Db, ctx.UserLookup, tokenService, ctx.AuditLog);
        var service = new AuthService(ctx.UserManager, ctx.Db, tokenService, mediator);

        var ex = await Assert.ThrowsAsync<BadRequestException>(() =>
            service.RegisterAsync(
                InvitationRegistration("other@example.com", "mismatch-invitation-token"),
                CancellationToken.None));

        Assert.Contains("match the invited email", ex.Message);
        Assert.Null(await ctx.UserManager.FindByEmailAsync("other@example.com"));
    }

    [Fact]
    public void Register_validator_requires_organization_only_without_invitation()
    {
        var validator = new RegisterValidator();
        var invitationRequest = InvitationRegistration("invitee@example.com", "invitation-token");
        var regularRequest = new RegisterRequest
        {
            FullName = "Regular User",
            Email = "regular@example.com",
            Password = "Password123",
            ConfirmPassword = "Password123",
        };

        Assert.True(validator.Validate(invitationRequest).IsValid);
        Assert.False(validator.Validate(regularRequest).IsValid);
    }
}
