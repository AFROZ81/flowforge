using FlowForge.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FlowForge.Infrastructure.Persistence.Configurations;

public sealed class WorkItemHistoryConfiguration : IEntityTypeConfiguration<WorkItemHistory>
{
    public void Configure(EntityTypeBuilder<WorkItemHistory> builder)
    {
        builder.Property(x => x.Description)
            .HasMaxLength(1000)
            .IsRequired();

        builder.Property(x => x.Action)
            .IsRequired();

        builder.HasOne(x => x.WorkItem)
            .WithMany(x => x.Histories)
            .HasForeignKey(x => x.WorkItemId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(x => new
        {
            x.WorkItemId,
            x.CreatedAt
        });
    }
}