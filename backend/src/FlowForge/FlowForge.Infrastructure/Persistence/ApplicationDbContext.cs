using FlowForge.Domain.Entities;
using FlowForge.Application.Interfaces;
using Microsoft.EntityFrameworkCore;
using FlowForge.Infrastructure.Identity;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using FlowForge.Application.Services.Authentication;
using FlowForge.Domain.Common.Base;
using FlowForge.Application.Common.Models;

namespace FlowForge.Infrastructure.Persistence;

/// <summary>
/// Represents the application's primary EF Core database context.
/// </summary>
public sealed class ApplicationDbContext : IdentityDbContext<ApplicationUser, IdentityRole<Guid>, Guid>, IApplicationDbContext
{
    private readonly ICurrentUserService _currentUser;

    public ApplicationDbContext(
        DbContextOptions<ApplicationDbContext> options,
        ICurrentUserService currentUser)
        : base(options)
    {
        _currentUser = currentUser;
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

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);

        modelBuilder.Entity<ApplicationUser>()
            .HasOne(u => u.Organization)
            .WithMany()
            .HasForeignKey(u => u.OrganizationId)
            .OnDelete(DeleteBehavior.Restrict);
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

        return await base.SaveChangesAsync(cancellationToken);
    }

    public async Task<List<OrganizationUserLookup>>
        GetOrganizationUsersAsync(Guid organizationId, CancellationToken cancellationToken = default)
    {
        return await Users
            .AsNoTracking()
            .Where(x =>
                x.OrganizationId ==
                organizationId)
            .OrderBy(x => x.FullName)
            .Select(x =>
                new OrganizationUserLookup
                {
                    Id = x.Id,
                    FullName = x.FullName,
                    Email = x.Email
                })
            .ToListAsync(
                cancellationToken);
    }
}