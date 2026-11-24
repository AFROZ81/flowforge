using MediatR;

namespace FlowForge.Application.Features.Organizations.Invitations.Accept;

/// <summary>
/// Query to validate an invitation token and return its details without accepting.
/// Used by the registration flow to pre-fill the invitee's email and show organization info.
/// </summary>
public sealed class AcceptInvitationQuery : IRequest<AcceptInvitationQueryResponse>
{
    public string Token { get; init; } = string.Empty;
}

/// <summary>
/// Response with invitation details for a valid token.
/// </summary>
public sealed class AcceptInvitationQueryResponse
{
    public string Email { get; init; } = string.Empty;
    public string OrganizationName { get; init; } = string.Empty;
    public string Role { get; init; } = string.Empty;
    public DateTime ExpiresAt { get; init; }
    public bool IsAccepted { get; init; }
}
