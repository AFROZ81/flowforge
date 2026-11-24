using FlowForge.Domain.Common.Base;
using FlowForge.Domain.Enums;

namespace FlowForge.Domain.Entities;

/// <summary>
/// Represents the many-to-many relationship between Users and Organizations.
/// </summary>
public sealed class OrganizationUser : EntityBase
{
    public Guid UserId { get; init; }

    public Guid OrganizationId { get; init; }

    public Organization Organization { get; init; } = default!;

    public UserRole Role { get; set; } = UserRole.Member;

    public void ChangeRole(UserRole newRole, Guid updatedBy)
    {
        Role = newRole;
        UpdatedAt = DateTime.UtcNow;
        UpdatedBy = updatedBy;
    }
}