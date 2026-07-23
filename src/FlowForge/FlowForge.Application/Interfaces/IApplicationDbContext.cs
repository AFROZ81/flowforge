using FlowForge.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace FlowForge.Application.Interfaces;

public interface IApplicationDbContext
{
    DbSet<Organization> Organizations { get; }

    DbSet<Project> Projects { get; }

    DbSet<Board> Boards { get; }

    DbSet<Column> Columns { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}