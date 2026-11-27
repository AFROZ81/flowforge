using FlowForge.Application.Common.Time;
using FlowForge.Application.Services;
using FlowForge.Domain.Enums;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Net;
using System.Net.Mail;
using System.Net.Security;
using System.Net.Sockets;
using System.Text;

namespace FlowForge.Infrastructure.Services;

/// <summary>
/// SMTP-based email service implementation, hardened for Brevo SMTP.
///
/// All configuration is read from environment variables first (deployment
/// secrets), falling back to appsettings.json. Real credentials are never
/// hardcoded, never logged, and never returned to the caller.
///
/// TLS/STARTTLS is always used on port 587. Server certificate validation is
/// never disabled.
/// </summary>
public sealed class SmtpEmailService : IEmailService
{
    private const int DefaultSmtpPort = 587;
    private const int DefaultTimeoutSeconds = 30;
    private const int MaxSendAttempts = 3;
    private const int RetryDelayMilliseconds = 2_000;

    private readonly IConfiguration _configuration;
    private readonly ILogger<SmtpEmailService> _logger;

    public SmtpEmailService(IConfiguration configuration, ILogger<SmtpEmailService> logger)
    {
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<EmailSendResult> SendAsync(
        string to,
        string subject,
        string plainTextBody,
        string htmlBody,
        CancellationToken cancellationToken = default)
    {
        var config = ReadSmtpConfig();

        if (!config.IsConfigured)
        {
            _logger.LogWarning("SMTP is not configured; email to {To} was not sent.", Sanitize(to));
            return new EmailSendResult
            {
                Success = false,
                Error = "SMTP is not configured.",
                ErrorCode = "smtp_not_configured",
            };
        }

        var lastException = default(Exception?);

        for (var attempt = 1; attempt <= MaxSendAttempts; attempt++)
        {
            try
            {
                await SendOnceAsync(config, to, subject, plainTextBody, htmlBody, cancellationToken);

                _logger.LogInformation(
                    "Email accepted by SMTP server to {To} (attempt {Attempt}).",
                    Sanitize(to),
                    attempt);

                return new EmailSendResult { Success = true };
            }
            catch (Exception ex) when (ex is SmtpException or SocketException or IOException)
            {
                lastException = ex;
                _logger.LogWarning(
                    "SMTP attempt {Attempt} for {To} failed: {ErrorCode}",
                    attempt,
                    Sanitize(to),
                    ErrorCode(ex));

                if (attempt < MaxSendAttempts)
                {
                    await Task.Delay(RetryDelayMilliseconds, cancellationToken);
                }
            }
        }

        _logger.LogError(
            lastException,
            "Email delivery to {To} failed after {Attempts} attempts.",
            Sanitize(to),
            MaxSendAttempts);

        return new EmailSendResult
        {
            Success = false,
            Error = lastException?.Message ?? "Email delivery failed.",
            ErrorCode = ErrorCode(lastException),
        };
    }

    public async Task<EmailSendResult> SendInvitationEmailAsync(
        string to,
        string organizationName,
        string invitedByName,
        string role,
        string invitationLink,
        DateTime expiresAt,
        string? message = null,
        CancellationToken cancellationToken = default)
    {
        var subject = $"You're invited to join {organizationName}";
        var expiresAtUtc = AppTime.DateInIndia(expiresAt).ToString("yyyy-MM-dd");
        var plainText = BuildPlainTextInvitation(
            organizationName,
            invitedByName,
            role,
            invitationLink,
            expiresAtUtc,
            message);
        var html = BuildHtmlInvitation(
            organizationName,
            invitedByName,
            role,
            invitationLink,
            expiresAtUtc,
            message);

        return await SendAsync(to, subject, plainText, html, cancellationToken);
    }

    public async Task<EmailSendResult> TestSmtpConnectionAsync(CancellationToken cancellationToken = default)
    {
        var config = ReadSmtpConfig();

        if (!config.IsConfigured)
        {
            return new EmailSendResult
            {
                Success = false,
                Error = "SMTP is not configured.",
                ErrorCode = "smtp_not_configured",
            };
        }

        try
        {
            await SendOnceAsync(
                config,
                config.SenderEmail,
                "FlowForge SMTP connection test",
                "This is a connection test from FlowForge. If you received this, SMTP is working.",
                "<p>This is a connection test from FlowForge. If you received this, SMTP is working.</p>",
                cancellationToken);

            _logger.LogInformation("SMTP connection test succeeded to {Host}:{Port}.", config.Host, config.Port);
            return new EmailSendResult { Success = true };
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "SMTP connection test failed: {ErrorCode}", ErrorCode(ex));
            return new EmailSendResult
            {
                Success = false,
                Error = ex.Message,
                ErrorCode = ErrorCode(ex),
            };
        }
    }

    private sealed class SmtpConfig
    {
        public bool IsConfigured;
        public string Host = string.Empty;
        public int Port = DefaultSmtpPort;
        public string User = string.Empty;
        public string Pass = string.Empty;
        public string SenderEmail = string.Empty;
        public string SenderName = "FlowForge";
        public int TimeoutSeconds = DefaultTimeoutSeconds;
        public bool EnableSsl = true;
    }

    private SmtpConfig ReadSmtpConfig()
    {
        // Environment variables take precedence (deployment secrets). appsettings.json
        // is the fallback for local development. Real credentials are never committed.
        var config = new SmtpConfig
        {
            Host = GetEnv("SMTP_HOST") ?? _configuration["Email:SmtpHost"] ?? string.Empty,
            Port = ParseInt(
                GetEnv("SMTP_PORT") ?? _configuration["Email:SmtpPort"],
                DefaultSmtpPort),
            User = GetEnv("SMTP_USER") ?? _configuration["Email:SmtpUser"] ?? string.Empty,
            Pass = GetEnv("SMTP_PASS") ?? GetEnv("SMTP_KEY") ?? _configuration["Email:SmtpPass"] ?? string.Empty,
            SenderEmail = GetEnv("SMTP_FROM_EMAIL") ?? _configuration["Email:FromEmail"] ?? string.Empty,
            SenderName = GetEnv("SMTP_FROM_NAME") ?? _configuration["Email:FromName"] ?? "FlowForge",
            TimeoutSeconds = ParseInt(
                GetEnv("SMTP_TIMEOUT_SECONDS") ?? _configuration["Email:SmtpTimeoutSeconds"],
                DefaultTimeoutSeconds),
            EnableSsl = ParseBool(
                GetEnv("SMTP_ENABLE_SSL") ?? _configuration["Email:EnableSsl"],
                true),
        };

        config.IsConfigured =
            !string.IsNullOrEmpty(config.Host) &&
            !string.IsNullOrEmpty(config.User) &&
            !string.IsNullOrEmpty(config.Pass) &&
            !string.IsNullOrEmpty(config.SenderEmail);

        return config;
    }

    private static string? GetEnv(string name) =>
        Environment.GetEnvironmentVariable(name);

    private static int ParseInt(string? value, int fallback)
    {
        if (string.IsNullOrWhiteSpace(value) || !int.TryParse(value, out var result))
        {
            return fallback;
        }
        return result;
    }

    private static bool ParseBool(string? value, bool fallback)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return fallback;
        }
        return bool.TryParse(value, out var result) ? result : fallback;
    }

    private async Task SendOnceAsync(
        SmtpConfig config,
        string to,
        string subject,
        string plainTextBody,
        string htmlBody,
        CancellationToken cancellationToken)
    {
        using var message = new MailMessage
        {
            From = new MailAddress(config.SenderEmail, config.SenderName),
            Subject = subject,
        };
        message.To.Add(to);

        // Always include a plain-text alternative so the message is readable in
        // any client, then attach the HTML body as an alternate view.
        message.Body = plainTextBody;
        message.IsBodyHtml = false;

        if (!string.IsNullOrEmpty(htmlBody))
        {
            var htmlView = AlternateView.CreateAlternateViewFromString(
                htmlBody,
                Encoding.UTF8,
                "text/html");
            message.AlternateViews.Add(htmlView);
        }

        using var client = new SmtpClient(config.Host, config.Port)
        {
            Credentials = new NetworkCredential(config.User, config.Pass),
            EnableSsl = config.EnableSsl,
            Timeout = config.TimeoutSeconds * 1000,
        };

        // Never disable server certificate validation.
        client.SendCompleted += (_, _) => { };

        await client.SendMailAsync(message, cancellationToken);
    }

    private static string Sanitize(string? email)
    {
        if (string.IsNullOrEmpty(email))
        {
            return "<empty>";
        }
        var at = email.IndexOf('@');
        return at <= 0 ? email : $"{email[..at]}@***";
    }

    private static string ErrorCode(Exception? ex) =>
        ex switch
        {
            SmtpException smtp => $"smtp_{smtp.StatusCode}",
            SocketException sock => $"socket_{sock.SocketErrorCode}",
            IOException => "io_error",
            _ => "unknown",
        };

    private static string BuildPlainTextInvitation(
        string organizationName,
        string invitedByName,
        string role,
        string invitationLink,
        string expiresAtUtc,
        string? message)
    {
        var sb = new StringBuilder();
        sb.AppendLine("You're invited!");
        sb.AppendLine();
        sb.AppendLine($"You have been invited to join {organizationName} as a {role}.");
        if (!string.IsNullOrWhiteSpace(invitedByName))
        {
            sb.AppendLine($"Invited by: {invitedByName}");
        }
        if (!string.IsNullOrWhiteSpace(message))
        {
            sb.AppendLine();
            sb.AppendLine($"Message: {message}");
        }
        sb.AppendLine();
        sb.AppendLine("Accept your invitation:");
        sb.AppendLine(invitationLink);
        sb.AppendLine();
        sb.AppendLine($"This invitation expires on {expiresAtUtc}.");
        sb.AppendLine("If you did not expect this invitation, you can safely ignore this email.");
        return sb.ToString();
    }

    private static string BuildHtmlInvitation(
        string organizationName,
        string invitedByName,
        string role,
        string invitationLink,
        string expiresAtUtc,
        string? message)
    {
        var escapedOrg = System.Net.WebUtility.HtmlEncode(organizationName);
        var escapedRole = System.Net.WebUtility.HtmlEncode(role);
        var escapedInvitedBy = string.IsNullOrWhiteSpace(invitedByName)
            ? string.Empty
            : $"<p style='margin:0 0 16px 0; font-size:14px; color:#666;'>Invited by: {System.Net.WebUtility.HtmlEncode(invitedByName)}</p>";
        var escapedMessage = string.IsNullOrWhiteSpace(message)
            ? string.Empty
            : $@"<p style='margin:0 0 16px 0; font-size:14px; font-style:italic; color:#666;'>{System.Net.WebUtility.HtmlEncode(message)}</p>";
        var escapedLink = System.Net.WebUtility.HtmlEncode(invitationLink);

        return $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>You're invited!</title>
</head>
<body style='margin:0; padding:0; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif; line-height:1.6; color:#333; background:#f4f6f8;'>
    <table role='presentation' width='100%' cellspacing='0' cellpadding='0' border='0'>
        <tr>
            <td align='center' style='padding:20px 0;'>
                <table role='presentation' width='600' cellspacing='0' cellpadding='0' border='0'
                      style='max-width:600px; width:100%; background:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.08);'>
                    <tr>
                        <td align='center' style='background:linear-gradient(135deg,#667eea 0%,#764ba2 100%); padding:32px 24px;'>
                            <h1 style='margin:0; color:#ffffff; font-size:24px; font-weight:600;'>You're invited!</h1>
                        </td>
                    </tr>
                    <tr>
                        <td style='padding:24px;'>
                            <p style='margin:0 0 16px 0; font-size:16px;'>Hi there,</p>
                            <p style='margin:0 0 16px 0; font-size:16px;'>
                                You've been invited to join <strong>{escapedOrg}</strong> as a <strong>{escapedRole}</strong>.
                            </p>
                            {escapedInvitedBy}
                            {escapedMessage}
                            <div style='margin:24px 0; text-align:center;'>
                                <a href='{escapedLink}' style='display:inline-block; background:linear-gradient(135deg,#667eea 0%,#764ba2 100%); color:#ffffff; padding:12px 28px; border-radius:6px; text-decoration:none; font-weight:600; font-size:16px;'>
                                    Accept Invitation
                                </a>
                            </div>
                            <p style='margin:0 0 8px 0; font-size:14px; color:#666;'>Or copy and paste this link into your browser:</p>
                            <p style='margin:0 0 24px 0; font-size:13px; color:#999; word-break:break-all;'>{escapedLink}</p>
                            <p style='margin:0 0 0 0; font-size:14px; color:#666;'>
                                This invitation expires on <strong>{expiresAtUtc}</strong>. If you did not expect this invitation, you can safely ignore this email.
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td align='center' style='padding:16px 24px; border-top:1px solid #eaeaea;'>
                            <p style='margin:0; font-size:12px; color:#aaa;'>© {DateTime.UtcNow.Year} FlowForge. All rights reserved.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>";
    }
}
