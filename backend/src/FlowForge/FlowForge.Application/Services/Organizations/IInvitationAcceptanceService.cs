using FlowForge.Application.Features.Organizations.Invitations.Accept;
using MediatR;

namespace FlowForge.Application.Services.Organizations;

/// <summary>
/// Interface for accepting organization invitations.
/// </summary>
public interface IInvitationAcceptanceService
{
    Task<AcceptInvitationResponse> AcceptAsync(AcceptInvitationCommand request, CancellationToken cancellationToken = default);
}