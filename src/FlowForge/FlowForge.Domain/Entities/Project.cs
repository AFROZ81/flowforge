using FlowForge.Domain.Common.Base;
using FlowForge.Domain.Enums;

namespace FlowForge.Domain.Entities;

/// <summary>
/// Represents a project within an organization.
/// </summary>
public sealed class Project : EntityBase
{
    /// <summary>
    /// Gets or sets the project name.
    /// </summary>
    public required string Name { get; init; }

    /// <summary>
    /// Gets or sets the project key.
    /// </summary>
    public required string Key { get; init; }

    /// <summary>
    /// Gets or sets the project description.
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// Gets or sets the planned start date.
    /// </summary>
    public DateOnly? StartDate { get; set; }

    /// <summary>
    /// Gets or sets the planned end date.
    /// </summary>
    public DateOnly? EndDate { get; set; }

    /// <summary>
    /// Gets or sets the current project status.
    /// </summary>
    public ProjectStatus Status { get; set; } = ProjectStatus.Planning;

    /// <summary>
    /// Gets or sets the owning organization identifier.
    /// </summary>
    public Guid OrganizationId { get; set; }
}