using FlowForge.Application.Features.Organizations;
using MediatR;

namespace FlowForge.Application.Features.Organizations.Get;

public sealed record GetOrganizationQuery(Guid OrganizationId)
    : IRequest<OrganizationResponse>;
