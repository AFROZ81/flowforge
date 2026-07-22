namespace FlowForge.Domain.Common.Base;

/// <summary>
/// Represents the base class for all domain entities.
/// Provides identity and audit information shared across the domain.
/// </summary>
public abstract class EntityBase
{
    /// <summary>
    /// Gets or internal sets the unique identifier of the entity.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or internal sets the UTC timestamp when the entity was created.
    /// </summary>
    public DateTime CreatedAt { get; internal set; }

    /// <summary>
    /// Gets or internal sets the UTC timestamp when the entity was last updated.
    /// </summary>
    public DateTime? UpdatedAt { get; internal set; }

    /// <summary>
    /// Gets or internal sets the identifier of the user who created the entity.
    /// </summary>
    public Guid? CreatedBy { get; internal set; }

    /// <summary>
    /// Gets or internal sets the identifier of the user who last updated the entity.
    /// </summary>
    public Guid? UpdatedBy { get; internal set; }

    /// <summary>
    /// Gets or internal sets a value indicating whether the entity has been soft deleted.
    /// </summary>
    public bool IsDeleted { get; internal set; }

    /// <summary>
    /// Gets or internal sets the UTC timestamp when the entity was deleted.
    /// </summary>
    public DateTime? DeletedAt { get; internal set; }
}