using FlowForge.Application.Features.Organizations;
using MediatR;

namespace FlowForge.Application.Features.Organizations.TransferOwnership;

public sealed record TransferOwnershipCommand(
    Guid OrganizationId,
    Guid TargetUserId) : IRequest<OrganizationSessionResponse>;
