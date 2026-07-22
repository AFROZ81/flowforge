using FlowForge.Domain.Entities;
using FlowForge.Application.Interfaces;
using Microsoft.EntityFrameworkCore;
using FlowForge.Infrastructure.Identity;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using FlowForge.Application.Services.Authentication;
using FlowForge.Domain.Common.Base;

namespace FlowForge.Infrastructure.Persistence;

/// <summary>
/// Represents the application's primary EF Core database context.
/// </summary>
public sealed class ApplicationDbContext : IdentityDbContext<ApplicationUser, IdentityRole<Guid>, Guid>, IApplicationDbContext
{
    private readonly ICurrentUserService _currentUser;

    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options, ICurrentUserService currentUser) : base(options)
    {
        _currentUser = currentUser;
    }   

     /// <summary>
    /// Organizations within the system.
    /// </summary>
    public DbSet<Organization> Organizations => Set<Organization>();

    public DbSet<Project> Projects => Set<Project>();

    public DbSet<Board> Boards => Set<Board>();

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
}
