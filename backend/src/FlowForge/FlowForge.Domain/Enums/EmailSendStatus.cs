namespace FlowForge.Domain.Enums;

/// <summary>
/// Delivery status of the invitation email.
///
/// An invitation is created and persisted regardless of whether the email is
/// successfully submitted to SMTP. The status lets administrators distinguish
/// between a pending invite, an invite whose email was sent, an invite whose
/// email delivery failed, an accepted invite, and an expired invite.
///
/// Confirmed inbox delivery is not claimed unless a provider delivery event is
/// actually available.
/// </summary>
public enum EmailSendStatus
{
    /// <summary>
    /// Invitation created; email has not yet been sent.
    /// </summary>
    NotSent = 0,

    /// <summary>
    /// Email was accepted by the SMTP server.
    /// </summary>
    Sent = 1,

    /// <summary>
    /// Email submission to SMTP failed (transient or permanent).
    /// </summary>
    Failed = 2,
}
