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

    public bool IsOwner { get; set; }

    public int TokenVersion { get; set; }

    public byte[] RowVersion { get; set; } = [];

    public void ChangeRole(UserRole newRole, Guid updatedBy)
    {
        Role = newRole;
        TokenVersion++;
        UpdatedAt = DateTime.UtcNow;
        UpdatedBy = updatedBy;
    }

    public void ChangeOwnership(bool isOwner, Guid updatedBy)
    {
        IsOwner = isOwner;
        TokenVersion++;
        UpdatedAt = DateTime.UtcNow;
        UpdatedBy = updatedBy;
    }

    public void SoftDelete(Guid deletedBy)
    {
        if (IsDeleted) return;

        IsDeleted = true;
        IsOwner = false;
        DeletedAt = DateTime.UtcNow;
        TokenVersion++;
        UpdatedAt = DateTime.UtcNow;
        UpdatedBy = deletedBy;
    }

    public void RestoreMembership(UserRole role, Guid updatedBy)
    {
        IsDeleted = false;
        DeletedAt = null;
        Role = role;
        IsOwner = false;
        TokenVersion++;
        UpdatedAt = DateTime.UtcNow;
        UpdatedBy = updatedBy;
    }

    public void InvalidateSession(Guid updatedBy)
    {
        TokenVersion++;
        UpdatedAt = DateTime.UtcNow;
        UpdatedBy = updatedBy;
    }
}