using FlowForge.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FlowForge.Infrastructure.Persistence.Configurations;

public sealed class ProjectConfiguration : IEntityTypeConfiguration<Project>
{
    public void Configure(EntityTypeBuilder<Project> builder)
    {
        builder.ToTable("Projects");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Name)
               .IsRequired()
               .HasMaxLength(200);

        builder.Property(x => x.Key)
               .IsRequired()
               .HasMaxLength(10);

        builder.Property(x => x.Description)
               .HasMaxLength(1000);

        builder.Property(x => x.Color)
               .HasMaxLength(20);

        builder.Property(x => x.Icon)
               .HasMaxLength(100);

        builder.HasOne(x => x.Organization)
               .WithMany(x => x.Projects)
               .HasForeignKey(x => x.OrganizationId)
               .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(x => new
        {
            x.OrganizationId,
            x.Key
        }).IsUnique();
    }
}