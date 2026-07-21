using FlowForge.Domain.Common.Base;

namespace FlowForge.Domain.Entities;

public sealed class Organization : EntityBase
{
    public required string Name { get; init; }

    public required string Slug { get; init; }

    public string? Description { get; set; }

    public string? LogoUrl { get; set; }

    public bool IsActive { get; set; } = true;

    public ICollection<Project> Projects { get; private set; } = new List<Project>();
}