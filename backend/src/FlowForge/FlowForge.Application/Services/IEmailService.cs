using FlowForge.Domain.Enums;

namespace FlowForge.Application.Services;

/// <summary>
/// Outcome of a single email delivery attempt.
///
/// SMTP acceptance does not guarantee inbox delivery; this reflects only
/// whether the message was accepted by the SMTP server.
/// </summary>
public sealed class EmailSendResult
{
    public bool Success { get; init; }
    public string? Error { get; init; }
    public string? ErrorCode { get; init; }
}

/// <summary>
/// Interface for sending emails.
///
/// Implementations must never log SMTP credentials, invitation tokens, or
/// full tokenized URLs.
/// </summary>
public interface IEmailService
{
    /// <summary>
    /// Sends an email with both a plain-text and an HTML body.
    /// </summary>
    Task<EmailSendResult> SendAsync(
        string to,
        string subject,
        string plainTextBody,
        string htmlBody,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Sends an invitation email.
    /// </summary>
    Task<EmailSendResult> SendInvitationEmailAsync(
        string to,
        string organizationName,
        string invitedByName,
        string role,
        string invitationLink,
        DateTime expiresAt,
        string? message = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Sends a due work-item reminder to the assignee.
    /// </summary>
    Task<EmailSendResult> SendWorkItemReminderEmailAsync(
        string to,
        string assigneeName,
        string workItemTitle,
        string organizationName,
        DateTime reminderAtUtc,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Tests SMTP connectivity/authentication/TLS without sending an email to
    /// any real recipient.
    /// </summary>
    Task<EmailSendResult> TestSmtpConnectionAsync(CancellationToken cancellationToken = default);
}
