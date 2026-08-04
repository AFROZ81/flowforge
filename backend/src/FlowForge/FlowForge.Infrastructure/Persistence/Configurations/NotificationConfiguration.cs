using FlowForge.Domain.Entities;
using FlowForge.Infrastructure.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FlowForge.Infrastructure.Persistence.Configurations;

public sealed class NotificationConfiguration : IEntityTypeConfiguration<Notification>
{
    public void Configure(EntityTypeBuilder<Notification> builder)
    {
        builder.ToTable("Notifications");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.OrganizationId)
            .IsRequired();

        builder.Property(x => x.RecipientId)
            .IsRequired();

        builder.Property(x => x.Type)
            .IsRequired();

        builder.Property(x => x.Title)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(x => x.Message)
            .IsRequired()
            .HasMaxLength(1000);

        builder.Property(x => x.IsRead)
            .IsRequired()
            .HasDefaultValue(false);

        builder.Property(x => x.ReadAt)
            .IsRequired(false);

        builder.HasOne(x => x.Organization)
            .WithMany(x => x.Notifications)
            .HasForeignKey(x => x.OrganizationId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(x => x.WorkItem)
            .WithMany(x => x.Notifications)
            .HasForeignKey(x => x.WorkItemId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne<ApplicationUser>()
            .WithMany()
            .HasForeignKey(x => x.RecipientId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(x => new
        {
            x.RecipientId,
            x.IsRead,
            x.CreatedAt
        });

        builder.HasIndex(x => new
        {
            x.OrganizationId,
            x.RecipientId,
            x.CreatedAt
        });

        builder.HasIndex(x => x.WorkItemId);
    }
}