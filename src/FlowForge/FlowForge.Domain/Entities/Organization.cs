using FlowForge.Domain.Common.Base;

namespace FlowForge.Domain.Entities;

/// <summary>
/// Represents an organization within FlowForge.
/// An organization owns projects, members, and future workspace resources.
/// </summary>
public sealed class Organization : EntityBase
{
    /// <summary>
    /// Gets or sets the organization name.
    /// </summary>
    public required string Name { get; init; }

    /// <summary>
    /// Gets or sets the unique URL-friendly slug.
    /// </summary>
    public required string Slug { get; init; }

    /// <summary>
    /// Gets or sets the organization description.
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// Gets or sets the organization logo URL.
    /// </summary>
    public string? LogoUrl { get; set; }

    /// <summary>
    /// Gets or sets whether the organization is active.
    /// </summary>
    public bool IsActive { get; set; } = true;
}