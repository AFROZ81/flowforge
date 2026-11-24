using FlowForge.Domain.Enums;

namespace FlowForge.Application.Features.Organizations.Invitations.Get;

/// <summary>
/// Response for listing organization invitations.
/// </summary>
public sealed class GetInvitationsResponse
{
    public Guid Id { get; init; }
    public string Email { get; init; } = string.Empty;
    public UserRole Role { get; init; }
    public bool IsAccepted { get; init; }
    public DateTime ExpiresAt { get; init; }
    public DateTime CreatedAt { get; init; }
    public string InvitedByName { get; init; } = string.Empty;

    /// <summary>
    /// Delivery status of the invitation email.
    /// </summary>
    public EmailSendStatus EmailStatus { get; init; }

    /// <summary>
    /// Email delivery error, if delivery failed (credentials are never included).
    /// </summary>
    public string? EmailError { get; init; }
}