using FlowForge.Application.Features.Organizations;
using MediatR;

namespace FlowForge.Application.Features.Organizations.Delete;

public sealed record DeleteOrganizationCommand(
    Guid OrganizationId,
    string ConfirmationSlug) : IRequest<OrganizationSessionResponse>;
