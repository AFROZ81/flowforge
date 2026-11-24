using MediatR;

namespace FlowForge.Application.Features.Organizations.Invitations.Accept;

/// <summary>
/// Command to accept an organization invitation.
/// </summary>
public sealed class AcceptInvitationCommand : IRequest<AcceptInvitationResponse>
{
    public string Token { get; init; } = string.Empty;
}