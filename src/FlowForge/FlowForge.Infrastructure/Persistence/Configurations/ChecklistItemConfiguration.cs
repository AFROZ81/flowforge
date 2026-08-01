using FlowForge.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FlowForge.Infrastructure.Persistence.Configurations;

public sealed class ChecklistItemConfiguration : IEntityTypeConfiguration<ChecklistItem>
{
    public void Configure(EntityTypeBuilder<ChecklistItem> builder)
    {
        builder.Property(x => x.Title)
            .HasMaxLength(500)
            .IsRequired();

        builder.Property(x => x.Order)
            .IsRequired();

        builder.Property(x => x.IsCompleted)
            .HasDefaultValue(false);

        builder.HasOne(x => x.WorkItem)
            .WithMany(x => x.ChecklistItems)
            .HasForeignKey(x => x.WorkItemId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(x => new
        {
            x.WorkItemId,
            x.Order
        });
    }
}