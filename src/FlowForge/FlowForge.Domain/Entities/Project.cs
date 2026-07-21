using FlowForge.Domain.Common.Base;

namespace FlowForge.Domain.Entities;

public sealed class Project : EntityBase
{
    public Guid OrganizationId { get; set; }

    public string Name { get; private set; } = string.Empty;

    public string Key { get; private set; } = string.Empty;

    public string? Description { get; private set; }

    public string Color { get; private set; } = "#2563EB";

    public string? Icon { get; private set; }

    public bool IsArchived { get; private set; }

    public Organization Organization { get; private set; } = null!;

    private Project()
    {
    }

    public Project(
        Guid organizationId,
        string name,
        string key,
        string? description,
        string color,
        string? icon)
    {
        Id = Guid.NewGuid();

        OrganizationId = organizationId;
        Name = name.Trim();
        Key = key.Trim().ToUpperInvariant();
        Description = description?.Trim();
        Color = color;
        Icon = icon;
        IsArchived = false;
    }

    public void Archive()
    {
        IsArchived = true;
    }

    public void Restore()
    {
        IsArchived = false;
    }

    public void Update(
        string name,
        string? description,
        string color,
        string? icon)
    {
        Name = name.Trim();
        Description = description?.Trim();
        Color = color;
        Icon = icon;
    }
}