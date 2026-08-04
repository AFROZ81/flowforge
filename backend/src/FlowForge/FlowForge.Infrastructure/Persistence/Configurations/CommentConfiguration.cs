using FlowForge.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FlowForge.Infrastructure.Persistence.Configurations;

public sealed class CommentConfiguration : IEntityTypeConfiguration<Comment>
{
    public void Configure(EntityTypeBuilder<Comment> builder)
    {
        builder.ToTable("Comments");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.WorkItemId)
            .IsRequired();

        builder.Property(x => x.AuthorId)
            .IsRequired();

        builder.Property(x => x.Content)
            .IsRequired()
            .HasMaxLength(4000);

        builder.Property(x => x.IsEdited)
            .IsRequired()
            .HasDefaultValue(false);

        builder.Property(x => x.EditedAt);

        builder.HasOne(x => x.WorkItem)
            .WithMany(w => w.Comments)
            .HasForeignKey(x => x.WorkItemId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(x => new
        {
            x.WorkItemId,
            x.CreatedAt
        });

        builder.HasIndex(x => x.AuthorId);
    }
}