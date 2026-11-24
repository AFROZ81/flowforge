using FlowForge.Domain.Enums;

namespace FlowForge.Application.Features.Organizations.Invitations.Create;

/// <summary>
/// Response after creating an organization invitation.
/// </summary>
public sealed class CreateInvitationResponse
{
    /// <summary>
    /// The ID of the created invitation.
    /// </summary>
    public Guid Id { get; init; }

    /// <summary>
    /// The email address of the invited user.
    /// </summary>
    public string Email { get; init; } = string.Empty;

    /// <summary>
    /// The role assigned to the invitation.
    /// </summary>
    public UserRole Role { get; init; }

    /// <summary>
    /// The token used to accept the invitation.
    /// </summary>
    public string Token { get; init; } = string.Empty;

    /// <summary>
    /// The expiration date of the invitation.
    /// </summary>
    public DateTime ExpiresAt { get; init; }

    /// <summary>
    /// Delivery status of the invitation email.
    /// </summary>
    public EmailSendStatus EmailStatus { get; init; }

    /// <summary>
    /// Email delivery error, if delivery failed (credentials are never included).
    /// </summary>
    public string? EmailError { get; init; }
}