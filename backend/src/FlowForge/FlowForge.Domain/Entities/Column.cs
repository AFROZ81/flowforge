using FlowForge.Domain.Common.Base;

namespace FlowForge.Domain.Entities;

public sealed class Column : EntityBase
{
    public Guid BoardId { get; private set; }

    public string Name { get; private set; } = string.Empty;

    public string? Description { get; private set; }

    public int DisplayOrder { get; private set; }

    public bool IsArchived { get; private set; }

    public Board Board { get; private set; } = default!;

    public ICollection<WorkItem> WorkItems { get; private set; } = new List<WorkItem>();

    private Column()
    {
    }

    public Column(Guid boardId, string name, string? description, int displayOrder)
    {
        Id = Guid.NewGuid();

        BoardId = boardId;

        Name = name;

        Description = description;

        DisplayOrder = displayOrder;

        IsArchived = false;
    }

    public void Update(string name, string? description, int displayOrder)
    {
        Name = name;

        Description = description;

        DisplayOrder = displayOrder;
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