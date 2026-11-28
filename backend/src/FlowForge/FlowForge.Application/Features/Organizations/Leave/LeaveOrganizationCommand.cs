using FlowForge.Application.Features.Organizations;
using MediatR;

namespace FlowForge.Application.Features.Organizations.Leave;

public sealed record LeaveOrganizationCommand(Guid OrganizationId)
    : IRequest<OrganizationSessionResponse>;
