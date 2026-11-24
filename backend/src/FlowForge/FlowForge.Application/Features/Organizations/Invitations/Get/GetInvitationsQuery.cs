using MediatR;

namespace FlowForge.Application.Features.Organizations.Invitations.Get;

/// <summary>
/// Query to get all invitations for an organization.
/// </summary>
public sealed class GetInvitationsQuery : IRequest<List<GetInvitationsResponse>>
{
    public Guid OrganizationId { get; init; }
}