using FlowForge.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FlowForge.Infrastructure.Persistence.Configurations;

public sealed class WorkItemLabelConfiguration : IEntityTypeConfiguration<WorkItemLabel>
{
    public void Configure(EntityTypeBuilder<WorkItemLabel> builder)
    {
        builder.ToTable("WorkItemLabels");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.WorkItemId)
            .IsRequired();

        builder.Property(x => x.LabelId)
            .IsRequired();

        builder.HasOne(x => x.WorkItem)
            .WithMany(x => x.WorkItemLabels)
            .HasForeignKey(x => x.WorkItemId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(x => x.Label)
            .WithMany(x => x.WorkItemLabels)
            .HasForeignKey(x => x.LabelId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(x => new
        {
            x.WorkItemId,
            x.LabelId
        })
        .IsUnique();

        builder.HasIndex(x => x.LabelId);
    }
}