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

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public Guid? CreatedBy { get; set; }

    public Guid? UpdatedBy { get; set; }

    public bool IsDeleted { get; set; }

    public DateTime? DeletedAt { get; set; }
}