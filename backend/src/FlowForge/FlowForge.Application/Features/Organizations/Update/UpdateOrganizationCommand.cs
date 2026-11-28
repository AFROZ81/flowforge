using FlowForge.Application.Features.Organizations;
using MediatR;

namespace FlowForge.Application.Features.Organizations.Update;

public sealed record UpdateOrganizationCommand(
    Guid OrganizationId,
    string Name,
    string? Description,
    string? LogoUrl) : IRequest<OrganizationResponse>;
