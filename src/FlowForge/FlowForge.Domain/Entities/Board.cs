using FlowForge.Domain.Common.Base;

namespace FlowForge.Domain.Entities;

public sealed class Board : EntityBase
{
    public Guid ProjectId { get; private set; }

    public string Name { get; private set; } = string.Empty;

    public string? Description { get; private set; }

    public bool IsArchived { get; private set; }

    public Project Project { get; private set; } = default!;

    private Board()
    {
    }

    public Board(Guid projectId, string name, string? description)
    {
        Id = Guid.NewGuid();

        ProjectId = projectId;

        Name = name;

        Description = description;

        IsArchived = false;
    }

    public void Update(string name, string? description)
    {
        Name = name;

        Description = description;
    }

    public void Archive()
    {
        if (IsArchived)
            return;

        IsArchived = true;
    }

    public void Restore()
    {
        if (!IsArchived)
            return;

        IsArchived = false;
    }
}