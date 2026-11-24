using MediatR;

namespace FlowForge.Application.Features.Organizations.Members.Remove;

/// <summary>
/// Command to remove a member from an organization.
/// </summary>
public sealed class RemoveMemberCommand : IRequest
{
    public Guid OrganizationId { get; init; }
    public Guid TargetUserId { get; init; }
}