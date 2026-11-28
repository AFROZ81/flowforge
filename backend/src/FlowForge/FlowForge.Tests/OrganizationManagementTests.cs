using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

using FlowForge.API.Controllers;
using FlowForge.Application.Common.Exceptions;
using FlowForge.Application.Common.Responses;
using FlowForge.Application.Common.Settings;
using FlowForge.Application.Features.AuditLogs.GetAuditLogs;
using FlowForge.Application.Features.Authentication.CurrentUser;
using FlowForge.Application.Features.Authentication.Login;
using FlowForge.Application.Features.Authentication.Register;
using FlowForge.Application.Features.Organizations;
using FlowForge.Application.Features.Organizations.Archive;
using FlowForge.Application.Features.Organizations.CreateOrganization;
using FlowForge.Application.Features.Organizations.Delete;
using FlowForge.Application.Features.Organizations.Get;
using FlowForge.Application.Features.Organizations.GetMine;
using FlowForge.Application.Features.Organizations.Invitations.Accept;
using FlowForge.Application.Features.Organizations.Leave;
using FlowForge.Application.Features.Organizations.Members.ChangeRole;
using FlowForge.Application.Features.Organizations.Members.Get;
using FlowForge.Application.Features.Organizations.Members.Remove;
using FlowForge.Application.Features.Organizations.Restore;
using FlowForge.Application.Features.Organizations.TransferOwnership;
using FlowForge.Application.Interfaces;
using FlowForge.Application.Services.Authentication;
using FlowForge.Application.Services.AuditLogs;
using FlowForge.Application.Services.Organizations;
using FlowForge.Application.Services.Presence;
using FlowForge.Application.Services.Realtime;
using FlowForge.Domain.Entities;
using FlowForge.Domain.Enums;
using FlowForge.Domain.Events;
using FlowForge.Infrastructure.Identity;
using FlowForge.Infrastructure.Persistence;
using FlowForge.Infrastructure.Services.Authentication;
using FlowForge.Infrastructure.Services.Organizations;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;
using Xunit;

namespace FlowForge.Tests;

public sealed class OrganizationManagementTests
{
    [Fact]
    public void OrganizationEndpointsUseAccountAndValidatedSessionPolicies()
    {
        AssertPolicy(typeof(OrganizationsController), "GetMine", "RequireAccount");
        AssertPolicy(typeof(OrganizationsController), "Create", "RequireAccount");
        AssertPolicy(typeof(OrganizationsController), "Switch", "RequireAccount");
        AssertPolicy(typeof(OrganizationsController), "Get", "RequireOrganizationSession");
        AssertPolicy(typeof(OrganizationsController), "Update", "RequireAdmin");
        AssertPolicy(typeof(OrganizationsController), "GetMembers", "RequireOrganizationSession");
        AssertPolicy(typeof(OrganizationsController), "ChangeMemberRole", "RequireAdmin");
        AssertPolicy(typeof(OrganizationsController), "RemoveMember", "RequireAdmin");
        AssertPolicy(typeof(OrganizationsController), "Leave", "RequireOrganizationSession");
        AssertPolicy(typeof(OrganizationsController), "TransferOwnership", "RequireOwner");
        AssertPolicy(typeof(OrganizationsController), "Archive", "RequireOwner");
        AssertPolicy(typeof(OrganizationsController), "Restore", "RequireAccount");
        AssertPolicy(typeof(OrganizationsController), "Delete", "RequireAccount");
        Assert.Null(typeof(OrganizationsController).GetMethod("Options"));

        AssertPolicy(typeof(InvitationsController), "Accept", "RequireAccount");
        AssertPolicy(typeof(InvitationsController), "Create", "RequireAdmin");
        AssertPolicy(typeof(InvitationsController), "Get", "RequireAdmin");
        AssertPolicy(typeof(InvitationsController), "Delete", "RequireAdmin");
        AssertPolicy(typeof(InvitationsController), "Resend", "RequireAdmin");
        Assert.True(typeof(InvitationsController).GetMethod("Validate")!
            .GetCustomAttributes(typeof(AllowAnonymousAttribute), true).Any());
    }

    [Fact]
    public void NormalRegistrationCannotSubmitAnOrganizationId()
    {
        Assert.Null(typeof(RegisterRequest).GetProperty("OrganizationId"));
        Assert.Null(typeof(RegisterRequest).GetProperty("Role"));
    }

    [Fact]
    public void MembershipDomainOperationsPreserveHistoryAndInvalidateTokens()
    {
        var membershipId = Guid.NewGuid();
        var actorId = Guid.NewGuid();
        var membership = new OrganizationUser
        {
            Id = membershipId,
            UserId = Guid.NewGuid(),
            OrganizationId = Guid.NewGuid(),
            Role = UserRole.Member,
            TokenVersion = 4,
        };

        membership.ChangeRole(UserRole.Admin, actorId);
        Assert.Equal(5, membership.TokenVersion);

        membership.ChangeOwnership(true, actorId);
        Assert.True(membership.IsOwner);
        Assert.Equal(6, membership.TokenVersion);

        membership.SoftDelete(actorId);
        Assert.True(membership.IsDeleted);
        Assert.False(membership.IsOwner);
        Assert.Equal(7, membership.TokenVersion);

        membership.RestoreMembership(UserRole.Viewer, actorId);
        Assert.False(membership.IsDeleted);
        Assert.False(membership.IsOwner);
        Assert.Equal(UserRole.Viewer, membership.Role);
        Assert.Equal(8, membership.TokenVersion);
        Assert.Equal(membershipId, membership.Id);
    }

    [Fact]
    public async Task CreateOrganizationGrantsOwnerMembershipAndOrganizationSession()
    {
        await using var fixture = await Fixture.CreateAsync();
        var handler = new CreateOrganizationCommandHandler(
            fixture.Db,
            fixture.CurrentUser,
            fixture.TokenService,
            fixture.Audit);

        var result = await handler.Handle(new CreateOrganizationRequest
        {
            Name = "New Workspace",
            Slug = "new-workspace",
        }, CancellationToken.None);

        var membership = await fixture.Db.OrganizationUsers.SingleAsync(
            x => x.OrganizationId == result.Id && x.UserId == fixture.OwnerUserId);
        Assert.True(membership.IsOwner);
        Assert.Equal(UserRole.Admin, membership.Role);
        Assert.Equal(result.OrganizationId, result.Id);

        var token = ReadToken(result.AccessToken);
        Assert.Equal(result.Id.ToString(), token.FindFirst("organizationId")?.Value);
        Assert.Equal(membership.Id.ToString(), token.FindFirst("membershipId")?.Value);
        Assert.Equal(UserRole.Admin.ToString(), token.FindFirst(ClaimTypes.Role)?.Value);
        Assert.Contains(fixture.Audit.Entries, x => x.Type == AuditLogType.OrganizationCreated);
    }

    [Fact]
    public async Task GetMineUsesMembershipsAndExcludesTerminallyDeletedOrganizations()
    {
        await using var fixture = await Fixture.CreateAsync();
        var legacyUser = await fixture.Db.Users.SingleAsync(x => x.Id == fixture.OwnerUserId);
        legacyUser.OrganizationId = Guid.Empty;

        var archived = new Organization { Name = "Archived Workspace", Slug = "archived-workspace", IsActive = false };
        var deleted = new Organization { Name = "Deleted Workspace", Slug = "deleted-workspace" };
        fixture.Db.Organizations.AddRange(archived, deleted);
        fixture.Db.OrganizationUsers.AddRange(
            new OrganizationUser
            {
                UserId = fixture.OwnerUserId,
                OrganizationId = archived.Id,
                Role = UserRole.Admin,
                IsOwner = true,
            },
            new OrganizationUser
            {
                UserId = fixture.OwnerUserId,
                OrganizationId = deleted.Id,
                Role = UserRole.Admin,
                IsOwner = true,
            });
        await fixture.Db.SaveChangesAsync();
        deleted.SoftDelete(fixture.OwnerUserId);
        await fixture.Db.SaveChangesAsync();

        var handler = new GetMyOrganizationsQueryHandler(fixture.Db, fixture.CurrentUser);
        var result = await handler.Handle(new GetMyOrganizationsQuery(), CancellationToken.None);

        Assert.Contains(result, x => x.Id == fixture.OrganizationId && x.IsActive && x.IsOwner);
        Assert.Contains(result, x => x.Id == archived.Id && !x.IsActive && x.IsOwner);
        Assert.DoesNotContain(result, x => x.Id == deleted.Id);
    }

    [Fact]
    public void GetMineQueryOrdersByDatabaseColumnsBeforeProjection()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseSqlServer("Server=localhost;Database=FlowForgeQueryVerification;Trusted_Connection=True;TrustServerCertificate=True")
            .Options;
        using var db = new ApplicationDbContext(
            options,
            new FakeCurrentUserService(),
            new FakeDomainEventDispatcher());

        var sql = GetMyOrganizationsQueryHandler
            .BuildQuery(db, Guid.NewGuid())
            .ToQueryString();

        Assert.Matches(@"ORDER BY .*\[IsActive\] DESC, .*\[Name\]", sql);
    }

    [Fact]
    public async Task SessionValidatorRejectsStaleTokensAndArchivedOrganizations()
    {
        await using var fixture = await Fixture.CreateAsync();
        var validator = new OrganizationSessionValidator(fixture.Db);

        var valid = await validator.ValidateAsync(
            fixture.OwnerUserId,
            fixture.OrganizationId,
            fixture.OwnerMembership.Id,
            fixture.OwnerMembership.TokenVersion);
        Assert.NotNull(valid);
        Assert.True(valid.IsOwner);

        fixture.OwnerMembership.ChangeRole(UserRole.Member, fixture.OwnerUserId);
        await fixture.Db.SaveChangesAsync();

        Assert.Null(await validator.ValidateAsync(
            fixture.OwnerUserId,
            fixture.OrganizationId,
            fixture.OwnerMembership.Id,
            fixture.OwnerMembership.TokenVersion - 1));

        var current = await validator.ValidateAsync(
            fixture.OwnerUserId,
            fixture.OrganizationId,
            fixture.OwnerMembership.Id,
            fixture.OwnerMembership.TokenVersion);
        Assert.NotNull(current);
        Assert.Equal(UserRole.Member, current.Role);

        fixture.Organization.Archive(fixture.OwnerUserId);
        await fixture.Db.SaveChangesAsync();
        Assert.Null(await validator.ValidateAsync(
            fixture.OwnerUserId,
            fixture.OrganizationId,
            fixture.OwnerMembership.Id,
            fixture.OwnerMembership.TokenVersion));
    }

    [Fact]
    public async Task MemberQueriesRejectCrossOrganizationRouteIds()
    {
        await using var fixture = await Fixture.CreateAsync();
        var foreignId = Guid.NewGuid();
        var profileHandler = new GetOrganizationQueryHandler(fixture.Db, fixture.CurrentUser, fixture.Rules);

        await Assert.ThrowsAsync<NotFoundException>(() =>
            profileHandler.Handle(new GetOrganizationQuery(foreignId), CancellationToken.None));

        var membersHandler = new GetMembersQueryHandler(fixture.Db, fixture.CurrentUser, fixture.UserLookup);
        await Assert.ThrowsAsync<NotFoundException>(() =>
            membersHandler.Handle(new GetMembersQuery { OrganizationId = foreignId }, CancellationToken.None));
    }

    [Fact]
    public async Task OwnerCannotBeDemotedRemovedOrLeaveWithoutTransfer()
    {
        await using var fixture = await Fixture.CreateAsync();
        await fixture.SetCurrentUserAsync(fixture.AdminUserId, UserRole.Admin);
        var roleHandler = new ChangeMemberRoleCommandHandler(
            fixture.Db, fixture.CurrentUser, fixture.UserLookup, fixture.Realtime, fixture.Audit);
        var removeHandler = new RemoveMemberCommandHandler(
            fixture.Db, fixture.CurrentUser, fixture.UserLookup, fixture.Audit, fixture.Realtime);

        await Assert.ThrowsAsync<BadRequestException>(() => roleHandler.Handle(
            new ChangeMemberRoleCommand
            {
                OrganizationId = fixture.OrganizationId,
                TargetUserId = fixture.OwnerUserId,
                Role = UserRole.Member,
            }, CancellationToken.None));
        await Assert.ThrowsAsync<BadRequestException>(() => removeHandler.Handle(
            new RemoveMemberCommand
            {
                OrganizationId = fixture.OrganizationId,
                TargetUserId = fixture.OwnerUserId,
            }, CancellationToken.None));

        await fixture.SetCurrentUserAsync(fixture.OwnerUserId, UserRole.Admin);
        var leaveHandler = new LeaveOrganizationCommandHandler(
            fixture.Db, fixture.CurrentUser, fixture.Rules, fixture.Audit, fixture.SessionService, fixture.Realtime);
        await Assert.ThrowsAsync<BadRequestException>(() => leaveHandler.Handle(
            new LeaveOrganizationCommand(fixture.OrganizationId), CancellationToken.None));
    }

    [Fact]
    public async Task LastAdminCannotLeave()
    {
        await using var fixture = await Fixture.CreateAsync();
        var organization = new Organization { Name = "Solo Admin", Slug = "solo-admin" };
        fixture.Db.Organizations.Add(organization);
        fixture.Db.OrganizationUsers.Add(new OrganizationUser
        {
            UserId = fixture.AdminUserId,
            OrganizationId = organization.Id,
            Role = UserRole.Admin,
            IsOwner = false,
        });
        await fixture.Db.SaveChangesAsync();
        await fixture.SetCurrentUserAsync(fixture.AdminUserId, UserRole.Admin, organization.Id);

        var handler = new LeaveOrganizationCommandHandler(
            fixture.Db, fixture.CurrentUser, fixture.Rules, fixture.Audit, fixture.SessionService, fixture.Realtime);
        await Assert.ThrowsAsync<BadRequestException>(() =>
            handler.Handle(new LeaveOrganizationCommand(organization.Id), CancellationToken.None));
    }

    [Fact]
    public async Task RemoveMemberSoftDeletesMembershipAndInvalidatesSession()
    {
        await using var fixture = await Fixture.CreateAsync();
        var previousVersion = fixture.MemberMembership.TokenVersion;
        var handler = new RemoveMemberCommandHandler(
            fixture.Db, fixture.CurrentUser, fixture.UserLookup, fixture.Audit, fixture.Realtime);

        await handler.Handle(new RemoveMemberCommand
        {
            OrganizationId = fixture.OrganizationId,
            TargetUserId = fixture.MemberUserId,
        }, CancellationToken.None);

        Assert.False(await fixture.Db.OrganizationUsers.AnyAsync(x => x.UserId == fixture.MemberUserId));
        var stored = await fixture.Db.OrganizationUsers.IgnoreQueryFilters()
            .SingleAsync(x => x.Id == fixture.MemberMembership.Id);
        Assert.True(stored.IsDeleted);
        Assert.True(stored.TokenVersion > previousVersion);
        Assert.Contains(fixture.Realtime.UserEvents, x => x.EventName == "MembershipChanged");
        Assert.Contains(fixture.Audit.Entries, x => x.Type == AuditLogType.OrganizationMemberRemoved);
    }

    [Fact]
    public async Task TransferOwnershipPromotesTargetAndDemotesFormerOwner()
    {
        await using var fixture = await Fixture.CreateAsync();
        var handler = new TransferOwnershipCommandHandler(
            fixture.Db, fixture.CurrentUser, fixture.Rules, fixture.Audit, fixture.SessionService, fixture.Realtime);

        var session = await handler.Handle(new TransferOwnershipCommand(
            fixture.OrganizationId, fixture.MemberUserId), CancellationToken.None);

        Assert.Equal(UserRole.Admin, fixture.MemberMembership.Role);
        Assert.True(fixture.MemberMembership.IsOwner);
        Assert.Equal(UserRole.Admin, fixture.OwnerMembership.Role);
        Assert.False(fixture.OwnerMembership.IsOwner);
        Assert.Equal(fixture.OrganizationId, session.OrganizationId);
        Assert.Equal(fixture.OwnerMembership.Id.ToString(), ReadToken(session.AccessToken).FindFirst("membershipId")?.Value);
        Assert.Contains(fixture.Audit.Entries, x => x.Type == AuditLogType.OwnershipTransferred);
    }

    [Fact]
    public async Task ArchiveRestoreAndDeleteEnforceLifecycleAndIssueFreshSessions()
    {
        await using var fixture = await Fixture.CreateAsync();
        var invitation = await fixture.AddInvitationAsync("invitee@example.com", UserRole.Member, "lifecycle-token");
        var ownerVersion = fixture.OwnerMembership.TokenVersion;
        var archiveHandler = new ArchiveOrganizationCommandHandler(
            fixture.Db, fixture.CurrentUser, fixture.Rules, fixture.Audit, fixture.SessionService, fixture.Realtime);

        var archivedSession = await archiveHandler.Handle(
            new ArchiveOrganizationCommand(fixture.OrganizationId), CancellationToken.None);
        Assert.False(fixture.Organization.IsActive);
        Assert.True(fixture.OwnerMembership.TokenVersion > ownerVersion);
        Assert.Null(ReadToken(archivedSession.AccessToken).FindFirst("organizationId"));
        Assert.True(invitation.IsDeleted);

        var restoreHandler = new RestoreOrganizationCommandHandler(
            fixture.Db, fixture.CurrentUser, fixture.Rules, fixture.Audit, fixture.SessionService, fixture.Realtime);
        var restoredSession = await restoreHandler.Handle(
            new RestoreOrganizationCommand(fixture.OrganizationId), CancellationToken.None);
        Assert.True(fixture.Organization.IsActive);
        Assert.False(invitation.IsDeleted);
        Assert.Equal(fixture.OrganizationId, restoredSession.OrganizationId);

        await archiveHandler.Handle(new ArchiveOrganizationCommand(fixture.OrganizationId), CancellationToken.None);
        var deleteHandler = new DeleteOrganizationCommandHandler(
            fixture.Db, fixture.CurrentUser, fixture.Rules, fixture.Audit, fixture.SessionService, fixture.Realtime);
        await Assert.ThrowsAsync<BadRequestException>(() => deleteHandler.Handle(
            new DeleteOrganizationCommand(fixture.OrganizationId, "wrong-slug"), CancellationToken.None));

        var deletedSession = await deleteHandler.Handle(
            new DeleteOrganizationCommand(fixture.OrganizationId, fixture.Organization.Slug), CancellationToken.None);
        Assert.Null(deletedSession.OrganizationId);
        Assert.True(await fixture.Db.Organizations.IgnoreQueryFilters().AnyAsync(x => x.Id == fixture.OrganizationId && x.IsDeleted));
        Assert.False(await fixture.Db.OrganizationUsers.IgnoreQueryFilters().AnyAsync(
            x => x.OrganizationId == fixture.OrganizationId && !x.IsDeleted));
        Assert.Contains(fixture.Audit.Entries, x => x.Type == AuditLogType.OrganizationDeleted);
    }

    [Fact]
    public async Task InvitationAcceptanceBindsEmailAndRestoresHistoricalMembership()
    {
        await using var fixture = await Fixture.CreateAsync();
        var membershipId = fixture.MemberMembership.Id;
        var previousVersion = fixture.MemberMembership.TokenVersion;
        fixture.MemberMembership.SoftDelete(fixture.OwnerUserId);
        await fixture.Db.SaveChangesAsync();
        var invitation = await fixture.AddInvitationAsync("member@example.com", UserRole.Viewer, "rejoin-token");

        await Assert.ThrowsAsync<BadRequestException>(() => new AcceptInvitationCommandHandler(
            fixture.Db, fixture.UserLookup, fixture.TokenService, fixture.Audit, fixture.CurrentUser).Handle(
            new AcceptInvitationCommand { Token = invitation.Token }, CancellationToken.None));

        await fixture.SetCurrentUserAsync(fixture.MemberUserId, UserRole.Member, Guid.Empty);
        var handler = new AcceptInvitationCommandHandler(
            fixture.Db, fixture.UserLookup, fixture.TokenService, fixture.Audit, fixture.CurrentUser);
        var result = await handler.Handle(
            new AcceptInvitationCommand { Token = invitation.Token }, CancellationToken.None);

        var restored = await fixture.Db.OrganizationUsers.IgnoreQueryFilters()
            .SingleAsync(x => x.Id == membershipId);
        Assert.False(restored.IsDeleted);
        Assert.False(restored.IsOwner);
        Assert.Equal(UserRole.Viewer, restored.Role);
        Assert.True(restored.TokenVersion > previousVersion);
        Assert.True(invitation.IsAccepted);
        Assert.Equal(fixture.OrganizationId.ToString(), ReadToken(result.AccessToken).FindFirst("organizationId")?.Value);
        Assert.Equal(UserRole.Viewer.ToString(), ReadToken(result.AccessToken).FindFirst(ClaimTypes.Role)?.Value);
    }

    [Fact]
    public async Task RegistrationLoginAndRefreshUseAccountFirstSessions()
    {
        await using var fixture = await Fixture.CreateAsync();
        const string email = "new-user@example.com";
        const string password = "Password123";

        var registration = await fixture.Auth.RegisterAsync(new RegisterRequest
        {
            FullName = "New User",
            Email = email,
            Password = password,
            ConfirmPassword = password,
        });
        var registeredToken = ReadToken(registration.AccessToken!);
        Assert.Null(registeredToken.FindFirst("organizationId"));
        var user = await fixture.Db.Users.SingleAsync(x => x.Email == email);
        Assert.Equal(Guid.Empty, user.OrganizationId);
        Assert.False(await fixture.Db.OrganizationUsers.AnyAsync(x => x.UserId == user.Id));

        var accountLogin = await fixture.Auth.LoginAsync(new LoginRequest { Email = email, Password = password });
        Assert.Null(ReadToken(accountLogin.AccessToken).FindFirst("organizationId"));

        var membership = new OrganizationUser
        {
            UserId = user.Id,
            OrganizationId = fixture.OrganizationId,
            Role = UserRole.Member,
            TokenVersion = 4,
        };
        fixture.Db.OrganizationUsers.Add(membership);
        await fixture.Db.SaveChangesAsync();
        var organizationLogin = await fixture.Auth.LoginAsync(new LoginRequest { Email = email, Password = password });
        Assert.Equal(fixture.OrganizationId.ToString(), ReadToken(organizationLogin.AccessToken).FindFirst("organizationId")?.Value);

        membership.ChangeRole(UserRole.Viewer, fixture.OwnerUserId);
        await fixture.Db.SaveChangesAsync();
        var staleUser = new AuthenticatedUser
        {
            UserId = user.Id,
            Email = email,
            FullName = "New User",
            OrganizationId = fixture.OrganizationId,
            MembershipId = membership.Id,
            TokenVersion = 4,
            Role = UserRole.Member,
        };
        Assert.Null(await new OrganizationSessionValidator(fixture.Db).ValidateAsync(
            user.Id, fixture.OrganizationId, membership.Id, 4));

        var refreshed = await fixture.Auth.RefreshTokenAsync(staleUser);
        Assert.Equal(UserRole.Viewer.ToString(), ReadToken(refreshed.AccessToken).FindFirst(ClaimTypes.Role)?.Value);

        membership.SoftDelete(fixture.OwnerUserId);
        await fixture.Db.SaveChangesAsync();
        var accountRefresh = await fixture.Auth.RefreshTokenAsync(staleUser);
        Assert.Null(ReadToken(accountRefresh.AccessToken).FindFirst("organizationId"));
    }

    [Fact]
    public async Task InvitationRegistrationCommitsAccountAndMembershipTogether()
    {
        await using var fixture = await Fixture.CreateAsync();
        var invitation = await fixture.AddInvitationAsync("invitee@example.com", UserRole.Member, "registration-token");
        var request = new RegisterRequest
        {
            FullName = "Invited User",
            Email = "invitee@example.com",
            Password = "Password123",
            ConfirmPassword = "Password123",
            InvitationToken = invitation.Token,
        };

        await Assert.ThrowsAsync<BadRequestException>(() => fixture.Auth.RegisterAsync(new RegisterRequest
        {
            FullName = "Wrong User",
            Email = "wrong@example.com",
            Password = "Password123",
            ConfirmPassword = "Password123",
            InvitationToken = invitation.Token,
        }));
        Assert.False(await fixture.Db.Users.AnyAsync(x => x.Email == "wrong@example.com"));
        Assert.False(invitation.IsAccepted);

        var response = await fixture.Auth.RegisterAsync(request);
        var user = await fixture.Db.Users.SingleAsync(x => x.Email == request.Email);
        var membership = await fixture.Db.OrganizationUsers.SingleAsync(x => x.UserId == user.Id);
        Assert.Equal(fixture.OrganizationId, membership.OrganizationId);
        Assert.Equal(UserRole.Member, membership.Role);
        Assert.True(invitation.IsAccepted);
        Assert.Equal(fixture.OrganizationId.ToString(), ReadToken(response.AccessToken!).FindFirst("organizationId")?.Value);
    }

    [Fact]
    public void MembershipModelAndMigrationEnforceOwnerAndRejoinInvariants()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseSqlServer("Server=localhost;Database=FlowForgeMigrationVerification;Trusted_Connection=True;TrustServerCertificate=True")
            .Options;
        using var context = new ApplicationDbContext(options, new FakeCurrentUserService(), new FakeDomainEventDispatcher());

        var entity = context.Model.FindEntityType(typeof(OrganizationUser))!;
        Assert.Equal(nameof(OrganizationUser.Id), entity.FindPrimaryKey()!.Properties.Single().Name);
        Assert.Contains(entity.GetIndexes(), x => x.IsUnique && x.GetFilter() == "IsDeleted = 0");
        Assert.Contains(entity.GetIndexes(), x => x.IsUnique && x.GetFilter() == "IsOwner = 1 AND IsDeleted = 0");

        var script = context.GetService<IMigrator>().GenerateScript(
            "20261128120000_AddReminderNotifiedAt",
            "20261128130000_AddOrganizationManagement");
        Assert.Contains("NEWID()", script, StringComparison.OrdinalIgnoreCase);
        Assert.Contains("LEFT JOIN OrganizationUsers", script, StringComparison.OrdinalIgnoreCase);
        Assert.Contains("ROW_NUMBER()", script, StringComparison.OrdinalIgnoreCase);
        Assert.Contains("THROW 50000", script, StringComparison.OrdinalIgnoreCase);
        Assert.Contains("IsOwner = 1 AND IsDeleted = 0", script, StringComparison.OrdinalIgnoreCase);
    }

    private static ClaimsPrincipal ReadToken(string token)
    {
        var jwt = new JwtSecurityTokenHandler().ReadJwtToken(token);
        return new ClaimsPrincipal(new ClaimsIdentity(jwt.Claims, "test"));
    }

    private static void AssertPolicy(Type controllerType, string methodName, string policy)
    {
        var method = controllerType.GetMethod(methodName)
            ?? throw new InvalidOperationException($"{controllerType.Name}.{methodName} was not found.");
        var attributes = method.GetCustomAttributes(typeof(AuthorizeAttribute), true)
            .Cast<AuthorizeAttribute>();
        Assert.Contains(attributes, x => x.Policy == policy);
    }

    private sealed class Fixture : IAsyncDisposable
    {
        public ApplicationDbContext Db { get; }
        public FakeCurrentUserService CurrentUser { get; } = new();
        public FakeUserLookupService UserLookup { get; }
        public FakeAuditLogService Audit { get; } = new();
        public FakeRealtimeNotifier Realtime { get; } = new();
        public TokenService TokenService { get; }
        public OrganizationSessionService SessionService { get; }
        public OrganizationRules Rules { get; }
        public UserManager<ApplicationUser> UserManager { get; }
        public AuthService Auth { get; }
        public Guid OrganizationId { get; private set; }
        public Guid OwnerUserId { get; private set; }
        public Guid MemberUserId { get; private set; }
        public Guid AdminUserId { get; private set; }
        public Organization Organization { get; private set; } = default!;
        public OrganizationUser OwnerMembership { get; private set; } = default!;
        public OrganizationUser MemberMembership { get; private set; } = default!;

        private Fixture()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;
            Db = new ApplicationDbContext(options, CurrentUser, new FakeDomainEventDispatcher());
            UserLookup = new FakeUserLookupService(Db);
            TokenService = new TokenService(Options.Create(new JwtSettings
            {
                Key = "flowforge-test-signing-key-with-at-least-32-bytes",
                Issuer = "flowforge-tests",
                Audience = "flowforge-client",
                ExpiryInMinutes = 30,
            }));
            SessionService = new OrganizationSessionService(Db, TokenService);
            Rules = new OrganizationRules(Db);

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
            Auth = new AuthService(UserManager, Db, TokenService, new FakeMediator(
                new AcceptInvitationCommandHandler(Db, UserLookup, TokenService, Audit, CurrentUser)));
        }

        public static async Task<Fixture> CreateAsync()
        {
            var fixture = new Fixture();
            await fixture.SeedAsync();
            return fixture;
        }

        private async Task SeedAsync()
        {
            OrganizationId = Guid.NewGuid();
            OwnerUserId = Guid.NewGuid();
            MemberUserId = Guid.NewGuid();
            AdminUserId = Guid.NewGuid();
            Organization = new Organization { Id = OrganizationId, Name = "Acme", Slug = "acme" };
            OwnerMembership = new OrganizationUser
            {
                Id = Guid.NewGuid(),
                UserId = OwnerUserId,
                OrganizationId = OrganizationId,
                Role = UserRole.Admin,
                IsOwner = true,
                TokenVersion = 2,
            };
            MemberMembership = new OrganizationUser
            {
                Id = Guid.NewGuid(),
                UserId = MemberUserId,
                OrganizationId = OrganizationId,
                Role = UserRole.Member,
            };

            Db.Organizations.Add(Organization);
            Db.Users.AddRange(
                CreateUser(OwnerUserId, "owner@example.com", "Owner User"),
                CreateUser(MemberUserId, "member@example.com", "Member User"),
                CreateUser(AdminUserId, "admin@example.com", "Admin User"));
            Db.OrganizationUsers.AddRange(
                OwnerMembership,
                MemberMembership,
                new OrganizationUser
                {
                    Id = Guid.NewGuid(),
                    UserId = AdminUserId,
                    OrganizationId = OrganizationId,
                    Role = UserRole.Admin,
                });
            await Db.SaveChangesAsync();
            await SetCurrentUserAsync(OwnerUserId, UserRole.Admin);
        }

        public async Task SetCurrentUserAsync(Guid userId, UserRole role, Guid? organizationId = null)
        {
            var targetOrganizationId = organizationId ?? OrganizationId;
            var user = await Db.Users.SingleAsync(x => x.Id == userId);
            var membership = await Db.OrganizationUsers.FirstOrDefaultAsync(
                x => x.UserId == userId && x.OrganizationId == targetOrganizationId);
            CurrentUser.User = new AuthenticatedUser
            {
                UserId = userId,
                Email = user.Email ?? string.Empty,
                FullName = user.FullName,
                OrganizationId = targetOrganizationId,
                OrganizationIds = membership is null ? [] : [targetOrganizationId],
                MembershipId = membership?.Id,
                TokenVersion = membership?.TokenVersion ?? 0,
                Role = role,
            };
        }

        public async Task<OrganizationInvitation> AddInvitationAsync(string email, UserRole role, string token)
        {
            var invitation = new OrganizationInvitation
            {
                Email = email,
                Role = role,
                Token = token,
                ExpiresAt = DateTime.UtcNow.AddDays(1),
                OrganizationId = OrganizationId,
                InvitedByUserId = OwnerUserId,
            };
            Db.OrganizationInvitations.Add(invitation);
            await Db.SaveChangesAsync();
            return invitation;
        }

        private static ApplicationUser CreateUser(Guid id, string email, string fullName) => new()
        {
            Id = id,
            UserName = email,
            Email = email,
            FullName = fullName,
            OrganizationId = Guid.Empty,
            Role = UserRole.Member,
        };

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

    private sealed class FakeUserLookupService(ApplicationDbContext db) : IUserLookupService
    {
        public async Task<UserLookupResult?> FindByEmailAsync(string email, CancellationToken cancellationToken = default)
        {
            var user = await db.Users.FirstOrDefaultAsync(
                x => x.NormalizedEmail == email.Trim().ToUpperInvariant(), cancellationToken);
            return user is null ? null : new UserLookupResult
            {
                Id = user.Id,
                Email = user.Email!,
                FullName = user.FullName,
            };
        }

        public async Task<UserLookupResult?> FindByIdAsync(Guid userId, CancellationToken cancellationToken = default)
        {
            var user = await db.Users.FirstOrDefaultAsync(x => x.Id == userId, cancellationToken);
            return user is null ? null : new UserLookupResult
            {
                Id = user.Id,
                Email = user.Email!,
                FullName = user.FullName,
            };
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
            => throw new NotSupportedException();

        public Task<AuditLogStatistics> GetStatisticsAsync(Guid organizationId, CancellationToken cancellationToken = default)
            => throw new NotSupportedException();
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
        {
            UserEvents.Add((userId, "RoleChanged", new { organizationId, newRole }));
            return Task.CompletedTask;
        }
    }

    private sealed class FakeMediator(AcceptInvitationCommandHandler acceptHandler) : IMediator
    {
        public async Task<TResponse> Send<TResponse>(
            IRequest<TResponse> request,
            CancellationToken cancellationToken = default)
        {
            if (request is AcceptInvitationCommand command)
                return (TResponse)(object)await acceptHandler.Handle(command, cancellationToken);
            throw new NotSupportedException();
        }

        public Task Send<TRequest>(TRequest request, CancellationToken cancellationToken = default)
            where TRequest : IRequest => Task.CompletedTask;

        public async Task<object?> Send(object request, CancellationToken cancellationToken = default)
        {
            if (request is AcceptInvitationCommand command)
                return await acceptHandler.Handle(command, cancellationToken);
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
}
