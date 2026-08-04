using FlowForge.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FlowForge.Infrastructure.Persistence.Configurations;

public sealed class AttachmentConfiguration : IEntityTypeConfiguration<Attachment>
{
    public void Configure(EntityTypeBuilder<Attachment> builder)
    {
        builder.ToTable("Attachments");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.WorkItemId)
            .IsRequired();

        builder.Property(x => x.UploadedById)
            .IsRequired();

        builder.Property(x => x.FileName)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(x => x.StoredFileName)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(x => x.ContentType)
            .IsRequired()
            .HasMaxLength(150);

        builder.Property(x => x.FileSize)
            .IsRequired();

        builder.Property(x => x.StoragePath)
            .IsRequired()
            .HasMaxLength(1000);

        builder.HasOne(x => x.WorkItem)
            .WithMany(x => x.Attachments)
            .HasForeignKey(x => x.WorkItemId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(x => new
        {
            x.WorkItemId,
            x.CreatedAt
        });

        builder.HasIndex(x => x.UploadedById);
    }
}