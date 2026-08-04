using FlowForge.Domain.Common.Base;

namespace FlowForge.Domain.Entities;

public sealed class Label : EntityBase
{
    public Guid OrganizationId { get; private set; }

    public string Name { get; private set; } = string.Empty;

    public string Color { get; private set; } = string.Empty;

    public string? Description { get; private set; }

    public Organization Organization { get; private set; } = default!;

    private readonly List<WorkItemLabel> _workItemLabels = new();

    public IReadOnlyCollection<WorkItemLabel> WorkItemLabels => _workItemLabels.AsReadOnly();

    private Label()
    {
    }

    public Label(Guid organizationId, string name, string color, string? description)
    {
        OrganizationId = organizationId;
        Name = name.Trim();
        Color = color.Trim();
        Description = description?.Trim();
    }

    public void Update(string name, string color, string? description)
    {
        Name = name.Trim();
        Color = color.Trim();
        Description = description?.Trim();
    }

    public void Delete()
    {
        if (IsDeleted)
            return;

        IsDeleted = true;
        DeletedAt = DateTime.UtcNow;
    }
}