using FlowForge.Domain.Entities;
using FlowForge.Application.Interfaces;
using Microsoft.EntityFrameworkCore;
using FlowForge.Infrastructure.Identity;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using FlowForge.Application.Services.Authentication;
using FlowForge.Domain.Common.Base;
using FlowForge.Application.Common.Models;
using FlowForge.Domain.Events;
using System.Linq.Expressions;

namespace FlowForge.Infrastructure.Persistence;

/// <summary>
/// Represents the application's primary EF Core database context.
/// </summary>
public sealed class ApplicationDbContext : IdentityDbContext<ApplicationUser, IdentityRole<Guid>, Guid>, IApplicationDbContext
{
    private readonly ICurrentUserService _currentUser;
    private readonly IDomainEventDispatcher _domainEventDispatcher;

    public ApplicationDbContext(
        DbContextOptions<ApplicationDbContext> options,
        ICurrentUserService currentUser,
        IDomainEventDispatcher domainEventDispatcher)
        : base(options)
    {
        _currentUser = currentUser;
        _domainEventDispatcher = domainEventDispatcher;
    }

    public DbSet<Organization> Organizations => Set<Organization>();

    public DbSet<Project> Projects => Set<Project>();

    public DbSet<Board> Boards => Set<Board>();

    public DbSet<Column> Columns => Set<Column>();

    public DbSet<WorkItem> WorkItems => Set<WorkItem>();

    public DbSet<Comment> Comments => Set<Comment>();

    public DbSet<Attachment> Attachments => Set<Attachment>();

    public DbSet<Label> Labels => Set<Label>();

    public DbSet<WorkItemLabel> WorkItemLabels => Set<WorkItemLabel>();

    public DbSet<Notification> Notifications => Set<Notification>();

    public DbSet<ChecklistItem> ChecklistItems => Set<ChecklistItem>();

    public DbSet<WorkItemWatcher> WorkItemWatchers => Set<WorkItemWatcher>();

    public DbSet<WorkItemHistory> WorkItemHistories => Set<WorkItemHistory>();

    public DbSet<OrganizationUser> OrganizationUsers => Set<OrganizationUser>();

    public DbSet<WebhookSubscription> WebhookSubscriptions => Set<WebhookSubscription>();

    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();

    public DbSet<OrganizationInvitation> OrganizationInvitations => Set<OrganizationInvitation>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);

        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            if (!typeof(EntityBase).IsAssignableFrom(entityType.ClrType))
                continue;

            var parameter = Expression.Parameter(entityType.ClrType, "entity");
            var isDeleted = Expression.Property(parameter, nameof(EntityBase.IsDeleted));
            var filter = Expression.Lambda(Expression.Not(isDeleted), parameter);

            entityType.SetQueryFilter(filter);
        }

        modelBuilder.Entity<OrganizationUser>(entity =>
        {
            entity.HasKey(ou => ou.Id);
            entity.Property(ou => ou.RowVersion).IsRowVersion();

            entity.HasOne<ApplicationUser>()
                .WithMany(u => u.OrganizationUsers)
                .HasForeignKey(ou => ou.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(ou => ou.Organization)
                .WithMany(o => o.Users)
                .HasForeignKey(ou => ou.OrganizationId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(ou => ou.OrganizationId);
            entity.HasIndex(ou => new { ou.UserId, ou.OrganizationId })
                .IsUnique()
                .HasFilter("IsDeleted = 0");
            entity.HasIndex(ou => new { ou.OrganizationId, ou.IsOwner })
                .IsUnique()
                .HasFilter("IsOwner = 1 AND IsDeleted = 0");
        });

        modelBuilder.Entity<WebhookSubscription>()
            .HasKey(w => w.Id);

        modelBuilder.Entity<WebhookSubscription>()
            .HasIndex(w => new { w.OrganizationId, w.IsActive });

        modelBuilder.Entity<WebhookSubscription>()
            .Property(w => w.EventTypes)
            .HasMaxLength(1000);

        modelBuilder.Entity<AuditLog>()
            .HasKey(a => a.Id);

        modelBuilder.Entity<AuditLog>()
            .HasIndex(a => new { a.OrganizationId, a.CreatedAt });

        modelBuilder.Entity<AuditLog>()
            .HasIndex(a => new { a.OrganizationId, a.Type });

        modelBuilder.Entity<AuditLog>()
            .HasIndex(a => new { a.OrganizationId, a.ActorId });

        modelBuilder.Entity<AuditLog>()
            .HasIndex(a => new { a.OrganizationId, a.TargetEntityId });

        modelBuilder.Entity<AuditLog>()
            .Property(a => a.OldValuesJson)
            .HasMaxLength(4000);

        modelBuilder.Entity<AuditLog>()
            .Property(a => a.NewValuesJson)
            .HasMaxLength(4000);

        modelBuilder.Entity<AuditLog>()
            .Property(a => a.MetadataJson)
            .HasMaxLength(4000);

        modelBuilder.Entity<OrganizationInvitation>()
            .HasKey(oi => oi.Id);

        modelBuilder.Entity<OrganizationInvitation>()
            .HasIndex(oi => oi.Token)
            .IsUnique();

        modelBuilder.Entity<OrganizationInvitation>()
            .HasIndex(oi => new { oi.OrganizationId, oi.Email });

        modelBuilder.Entity<OrganizationInvitation>()
            .HasIndex(oi => oi.ExpiresAt);

        modelBuilder.Entity<OrganizationInvitation>()
            .HasOne(oi => oi.Organization)
            .WithMany()
            .HasForeignKey(oi => oi.OrganizationId)
            .OnDelete(DeleteBehavior.Cascade);

        // InvitedByUser and AcceptedByUser are configured via foreign keys only
        // Navigation properties are not defined on the domain entity to avoid cross-layer dependency
        modelBuilder.Entity<OrganizationInvitation>()
            .HasOne<ApplicationUser>()
            .WithMany()
            .HasForeignKey(oi => oi.InvitedByUserId)
            .OnDelete(DeleteBehavior.Restrict)
            .IsRequired();

        modelBuilder.Entity<OrganizationInvitation>()
            .HasOne<ApplicationUser>()
            .WithMany()
            .HasForeignKey(oi => oi.AcceptedByUserId)
            .OnDelete(DeleteBehavior.SetNull)
            .IsRequired(false);
    }

public override async Task<int> SaveChangesAsync(
        CancellationToken cancellationToken = default)
    {
        var entries = ChangeTracker
            .Entries<EntityBase>();

        /*
         * Audit stamping cannot require a signed-in principal: creating the
         * first account, and the workspace it lands in, are writes that by
         * definition happen while nobody is authenticated. Reading the user
         * here used to throw for those requests, which meant the application
         * could never bootstrap itself.
         *
         * Author columns stay null when there is no one to record; every
         * endpoint that actually needs a user still asks for one and still
         * fails closed the same way it always did.
         */
        var currentUserId = _currentUser.TryGetUser()?.UserId;

        foreach (var entry in entries)
        {
            switch (entry.State)
            {
                case EntityState.Added:

                    entry.Entity.CreatedAt = DateTime.UtcNow;
                    entry.Entity.IsDeleted = false;

                    if (currentUserId is not null)
                        entry.Entity.CreatedBy = currentUserId;

                    break;

                case EntityState.Modified:

                    entry.Entity.UpdatedAt = DateTime.UtcNow;

                    if (currentUserId is not null)
                        entry.Entity.UpdatedBy = currentUserId;

                    break;
            }
        }

        var result = await base.SaveChangesAsync(cancellationToken);

        // Dispatch domain events after successful save
        var entitiesWithEvents = ChangeTracker
            .Entries<EntityBase>()
            .Where(e => e.Entity.DomainEvents.Any())
            .Select(e => e.Entity)
            .ToList();

        foreach (var entity in entitiesWithEvents)
        {
            var events = entity.DomainEvents.ToList();
            entity.ClearDomainEvents();

            foreach (var domainEvent in events)
            {
                await _domainEventDispatcher.DispatchAsync(domainEvent, cancellationToken);
            }
        }

        return result;
    }

    public async Task ExecuteInTransactionAsync(
        Func<Task> operation,
        CancellationToken cancellationToken = default)
    {
        if (Database.ProviderName == "Microsoft.EntityFrameworkCore.InMemory")
        {
            await operation();
            return;
        }

        await using var transaction = await Database.BeginTransactionAsync(cancellationToken);
        await operation();
        await transaction.CommitAsync(cancellationToken);
    }

    public async Task<List<OrganizationUserLookup>>
        GetOrganizationUsersAsync(Guid organizationId, CancellationToken cancellationToken = default)
    {
        return await OrganizationUsers
            .AsNoTracking()
            .Where(ou => ou.OrganizationId == organizationId)
            .Join(
                Users.AsNoTracking(),
                ou => ou.UserId,
                u => u.Id,
                (ou, u) => new OrganizationUserLookup
                {
                    Id = u.Id,
                    FullName = u.FullName,
                    Email = u.Email
                })
            .OrderBy(x => x.FullName)
            .ToListAsync(cancellationToken);
    }
}