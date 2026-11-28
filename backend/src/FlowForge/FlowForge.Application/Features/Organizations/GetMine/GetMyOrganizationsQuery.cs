using FlowForge.Application.Features.Organizations;
using MediatR;

namespace FlowForge.Application.Features.Organizations.GetMine;

public sealed record GetMyOrganizationsQuery
    : IRequest<List<OrganizationMembershipResponse>>;
