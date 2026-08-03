using FlowForge.Domain.Entities;
using FlowForge.Infrastructure.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FlowForge.Infrastructure.Persistence.Configurations;

public sealed class WorkItemConfiguration : IEntityTypeConfiguration<WorkItem>
{
    public void Configure(EntityTypeBuilder<WorkItem> builder)
    {
        builder.ToTable("WorkItems");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Title)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(x => x.Description)
            .HasMaxLength(2000);

        builder.Property(x => x.Priority)
            .IsRequired();

        builder.Property(x => x.Status)
            .IsRequired();

        builder.Property(x => x.DisplayOrder)
            .IsRequired();

        builder.Property(x => x.DueDate);

        builder.Property(x => x.AssigneeId)
            .IsRequired(false);

        builder.Property(x => x.IsArchived)
            .HasDefaultValue(false);

        builder.Property(x => x.ReminderDate);

        builder.HasOne(x => x.Column)
            .WithMany(c => c.WorkItems)
            .HasForeignKey(x => x.ColumnId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne<ApplicationUser>()
            .WithMany()
            .HasForeignKey(x => x.AssigneeId)
            .OnDelete(DeleteBehavior.Restrict);    

        builder.HasIndex(x => x.AssigneeId);

        builder.HasIndex(x => new
        {
            x.ColumnId,
            x.DisplayOrder
        });

        builder.HasIndex(x => new
        {
            x.ColumnId,
            x.IsArchived
        });
    }
}