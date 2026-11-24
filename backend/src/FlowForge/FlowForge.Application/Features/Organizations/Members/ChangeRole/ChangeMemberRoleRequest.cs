using System.ComponentModel.DataAnnotations;
using FlowForge.Domain.Enums;

namespace FlowForge.Application.Features.Organizations.Members.ChangeRole;

/// <summary>
/// Request to change a member's role.
/// </summary>
public sealed class ChangeMemberRoleRequest
{
    /// <summary>
    /// The new role to assign to the member.
    /// </summary>
    [Required]
    public UserRole Role { get; init; }
}