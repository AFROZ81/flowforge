using MediatR;

namespace FlowForge.Application.Features.Organizations.Members.Get;

/// <summary>
/// Query to get all members of an organization.
/// </summary>
public sealed class GetMembersQuery : IRequest<List<GetMembersResponse>>
{
    public Guid OrganizationId { get; init; }
}