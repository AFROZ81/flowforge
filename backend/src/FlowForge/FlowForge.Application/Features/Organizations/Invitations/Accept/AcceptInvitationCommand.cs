using MediatR;

namespace FlowForge.Application.Features.Organizations.Invitations.Accept;

/// <summary>
/// Command to accept an organization invitation.
/// </summary>
public sealed class AcceptInvitationCommand : IRequest<AcceptInvitationResponse>
{
    public string Token { get; init; } = string.Empty;

    /// <summary>
    /// Internal registration flow only. Public acceptance derives identity from auth.
    /// </summary>
    public Guid? AcceptingUserId { get; init; }
}