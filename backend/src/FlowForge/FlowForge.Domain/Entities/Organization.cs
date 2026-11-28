using FlowForge.Domain.Common.Base;
using FlowForge.Domain.Entities;

namespace FlowForge.Domain.Entities;

public sealed class Organization : EntityBase
{
    public required string Name { get; set; }

    public required string Slug { get; init; }

    public string? Description { get; set; }

    public string? LogoUrl { get; set; }

    public bool IsActive { get; set; } = true;

    public ICollection<Project> Projects { get; private set; } = new List<Project>();

    public ICollection<Label> Labels { get; private set; } = new List<Label>();

    public ICollection<Notification> Notifications { get; private set; } = new List<Notification>();

    public ICollection<OrganizationUser> Users { get; private set; } = new List<OrganizationUser>();

    public void UpdateProfile(string name, string? description, string? logoUrl, Guid updatedBy)
    {
        Name = name.Trim();
        Description = description?.Trim();
        LogoUrl = logoUrl?.Trim();
        UpdatedAt = DateTime.UtcNow;
        UpdatedBy = updatedBy;
    }

    public void Archive(Guid updatedBy)
    {
        if (!IsActive)
            return;

        IsActive = false;
        UpdatedAt = DateTime.UtcNow;
        UpdatedBy = updatedBy;
    }

    public void Restore(Guid updatedBy)
    {
        if (IsActive)
            return;

        IsActive = true;
        UpdatedAt = DateTime.UtcNow;
        UpdatedBy = updatedBy;
    }

    public void SoftDelete(Guid deletedBy)
    {
        if (IsDeleted)
            return;

        IsActive = false;
        IsDeleted = true;
        DeletedAt = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
        UpdatedBy = deletedBy;
    }
}