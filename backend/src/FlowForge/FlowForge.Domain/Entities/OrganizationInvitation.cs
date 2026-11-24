using FlowForge.Domain.Common.Base;
using FlowForge.Domain.Enums;

namespace FlowForge.Domain.Entities;

/// <summary>
/// Represents an invitation to join an organization.
/// </summary>
public sealed class OrganizationInvitation : EntityBase
{
    public string Email { get; set; } = string.Empty;
    public UserRole Role { get; set; } = UserRole.Member;
    public string Token { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public bool IsAccepted { get; set; }
    public Guid? AcceptedByUserId { get; set; }
    public DateTime? AcceptedAt { get; set; }
    public Guid OrganizationId { get; set; }
    public Organization Organization { get; set; } = default!;
    public Guid InvitedByUserId { get; set; }

    /// <summary>
    /// Delivery status of the invitation email.
    /// </summary>
    public EmailSendStatus EmailStatus { get; set; } = EmailSendStatus.NotSent;

    /// <summary>
    /// Last SMTP error message, if any (credentials/tokens are never stored here).
    /// </summary>
    public string? EmailError { get; set; }

    /// <summary>
    /// Time the email was last marked as sent, if any.
    /// </summary>
    public DateTime? EmailSentAt { get; set; }

    /// <summary>
    /// Number of email delivery attempts made for this invitation.
    /// </summary>
    public int EmailAttempts { get; set; }

    /// <summary>
    /// Time of the last email delivery attempt.
    /// </summary>
    public DateTime? LastEmailSendAt { get; set; }
}
