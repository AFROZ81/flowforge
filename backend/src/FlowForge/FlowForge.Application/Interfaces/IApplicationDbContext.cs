using FlowForge.Domain.Entities;
using FlowForge.Application.Common.Models;
using Microsoft.EntityFrameworkCore;

namespace FlowForge.Application.Interfaces;

public interface IApplicationDbContext
{
    DbSet<Organization> Organizations { get; }

    DbSet<Project> Projects { get; }

    DbSet<Board> Boards { get; }

    DbSet<Column> Columns { get; }

    DbSet<WorkItem> WorkItems { get; }

    DbSet<Comment> Comments { get; }

    DbSet<Attachment> Attachments { get; }

    DbSet<Label> Labels { get; }

    DbSet<WorkItemLabel> WorkItemLabels { get; }

    DbSet<Notification> Notifications { get; }

    DbSet<ChecklistItem> ChecklistItems { get; }

    DbSet<WorkItemWatcher> WorkItemWatchers { get; }

    DbSet<WorkItemHistory> WorkItemHistories { get; }

    Task<List<OrganizationUserLookup>> GetOrganizationUsersAsync(Guid organizationId, CancellationToken cancellationToken = default);

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}