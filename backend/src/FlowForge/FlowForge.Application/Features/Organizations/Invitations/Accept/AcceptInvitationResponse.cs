namespace FlowForge.Application.Features.Organizations.Invitations.Accept;

/// <summary>
/// Response after accepting an organization invitation.
/// </summary>
public sealed class AcceptInvitationResponse
{
    public Guid UserId { get; init; }
    public string AccessToken { get; init; } = string.Empty;
    public DateTime ExpiresAtUtc { get; init; }
}