using FlowForge.Domain.Enums;

namespace FlowForge.Application.Features.Organizations.Members.ChangeRole;

/// <summary>
/// Response after changing a member's role.
/// </summary>
public sealed class ChangeMemberRoleResponse
{
    public Guid UserId { get; init; }
    public UserRole Role { get; init; }
    public DateTime UpdatedAt { get; init; }
}