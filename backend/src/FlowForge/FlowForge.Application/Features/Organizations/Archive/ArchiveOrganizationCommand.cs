using FlowForge.Application.Features.Organizations;
using MediatR;

namespace FlowForge.Application.Features.Organizations.Archive;

public sealed record ArchiveOrganizationCommand(Guid OrganizationId)
    : IRequest<OrganizationSessionResponse>;
