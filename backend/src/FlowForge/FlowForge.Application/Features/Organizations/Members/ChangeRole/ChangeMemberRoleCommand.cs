using MediatR;
using FlowForge.Domain.Enums;

namespace FlowForge.Application.Features.Organizations.Members.ChangeRole;

/// <summary>
/// Command to change a member's role in an organization.
/// </summary>
public sealed class ChangeMemberRoleCommand : IRequest<ChangeMemberRoleResponse>
{
    public Guid OrganizationId { get; init; }
    public Guid TargetUserId { get; init; }
    public UserRole Role { get; init; }
}