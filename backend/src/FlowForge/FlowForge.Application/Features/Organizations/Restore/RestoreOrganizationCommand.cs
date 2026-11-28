using FlowForge.Application.Features.Organizations;
using MediatR;

namespace FlowForge.Application.Features.Organizations.Restore;

public sealed record RestoreOrganizationCommand(Guid OrganizationId)
    : IRequest<OrganizationSessionResponse>;
