using FlowForge.Application.Common.Exceptions;
using FlowForge.Application.Features.Organizations.Invitations.Create;
using FlowForge.Application.Interfaces;
using FlowForge.Application.Services;
using FlowForge.Application.Services.Authentication;
using FlowForge.Application.Services.AuditLogs;
using FlowForge.Application.Services.Organizations;
using FlowForge.Domain.Entities;
using FlowForge.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Text.Json;

namespace FlowForge.Application.Features.Organizations.Invitations.Create;

/// <summary>
/// Handles <see cref="CreateInvitationCommand"/>.
///
/// The invitation record is always created and persisted, even if the email
/// cannot be delivered. Email delivery status is tracked on the invitation so
/// administrators can see whether the email was sent or failed, and can retry
/// via the resend endpoint without creating a duplicate invitation.
/// </summary>
public sealed class CreateInvitationCommandHandler : IRequestHandler<CreateInvitationCommand, CreateInvitationResponse>
{
    private const int MaxInvitationsPerAdminPerHour = 10;

    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly IEmailService _emailService;
    private readonly IUserLookupService _userLookup;
    private readonly IAuditLogService _auditLogService;
    private readonly IConfiguration _configuration;
    private readonly ILogger<CreateInvitationCommandHandler> _logger;

    public CreateInvitationCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser,
        IEmailService emailService,
        IUserLookupService userLookup,
        IAuditLogService auditLogService,
        IConfiguration configuration,
        ILogger<CreateInvitationCommandHandler> logger)
    {
        _context = context;
        _currentUser = currentUser;
        _emailService = emailService;
        _userLookup = userLookup;
        _auditLogService = auditLogService;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<CreateInvitationResponse> Handle(
        CreateInvitationCommand request,
        CancellationToken cancellationToken)
    {
        var currentUser = _currentUser.User;

        // Authorize: only organization admins can invite users.
        var isAdmin = await _context.OrganizationUsers
            .AsNoTracking()
            .AnyAsync(
                ou => ou.UserId == currentUser.UserId &&
                      ou.OrganizationId == request.OrganizationId &&
                      ou.Role == UserRole.Admin,
                cancellationToken);

        if (!isAdmin)
        {
            throw new ForbiddenException("Only organization admins can invite users.");
        }

        // Rate limit: maximum invitations per admin per hour.
        var oneHourAgo = DateTime.UtcNow.AddHours(-1);
        var recentInviteCount = await _context.OrganizationInvitations
            .AsNoTracking()
            .CountAsync(
                i => i.OrganizationId == request.OrganizationId &&
                     i.InvitedByUserId == currentUser.UserId &&
                     i.CreatedAt >= oneHourAgo,
                cancellationToken);

        if (recentInviteCount >= MaxInvitationsPerAdminPerHour)
        {
            throw new ConflictException(
                "Invitation rate limit reached. Please try again later.");
        }

        // Normalize the email once so the duplicate check, the member check,
        // and the created record all use the same casing/whitespace.
        var normalizedEmail = NormalizeEmail(request.Email);

        // Reject if the email is already a member of the organization.
        var existingUser = await _userLookup.FindByEmailAsync(request.Email, cancellationToken);

        if (existingUser is not null)
        {
            var isMember = await _context.OrganizationUsers
                .AsNoTracking()
                .AnyAsync(
                    ou => ou.UserId == existingUser.Id &&
                          ou.OrganizationId == request.OrganizationId,
                    cancellationToken);

            if (isMember)
            {
                throw new ConflictException("User is already a member of this organization.");
            }
        }

        // Reject if there is already a pending, unexpired invitation for this email.
        // An invitation is pending only if:
        //   - not accepted,
        //   - not revoked/soft-deleted,
        //   - expiration date is still in the future,
        //   - belongs to the current organization.
        // Emails are stored normalized (trimmed, lowercase) at write time, but
        // pre-existing records may use different casing. ToLower translates to
        // SQL Server, unlike string.Equals with StringComparison, and keeps the
        // duplicate check case-insensitive regardless of how the record was stored.
        var existingInvitation = await _context.OrganizationInvitations
            .AsNoTracking()
            .AnyAsync(
                i => !i.IsDeleted &&
                     !i.IsAccepted &&
                     i.ExpiresAt > DateTime.UtcNow &&
                     i.OrganizationId == request.OrganizationId &&
                     i.Email.Trim().ToLower() == normalizedEmail,
                cancellationToken);

        if (existingInvitation)
        {
            // Diagnostics: log why the duplicate check blocked creation without
            // revealing any secrets (tokens, credentials).
            _logger.LogWarning(
                "Duplicate invitation blocked for Organization {OrganizationId}, Email {NormalizedEmail}. Reason: an active pending invitation already exists.",
                request.OrganizationId,
                MaskEmail(normalizedEmail));

            throw new ConflictException("A pending invitation already exists for this email address.");
        }

        // Generate secure token and create the invitation record.
        var expiresAt = DateTime.UtcNow.AddDays(7);
        var invitation = new OrganizationInvitation
        {
            Id = Guid.NewGuid(),
            Email = normalizedEmail,
            Role = request.Role,
            Token = GenerateSecureToken(),
            ExpiresAt = expiresAt,
            OrganizationId = request.OrganizationId,
            InvitedByUserId = currentUser.UserId,
            EmailStatus = EmailSendStatus.NotSent,
        };

        _context.OrganizationInvitations.Add(invitation);
        await _context.SaveChangesAsync(cancellationToken);

        // Attempt to send the invitation email. A transient email failure must
        // not destroy the invitation; the status is tracked for retry.
        var emailResult = await SendInvitationEmailAsync(
            request,
            invitation,
            cancellationToken);

        invitation.EmailAttempts++;
        invitation.LastEmailSendAt = DateTime.UtcNow;

        if (emailResult.Success)
        {
            invitation.EmailStatus = EmailSendStatus.Sent;
            invitation.EmailSentAt = DateTime.UtcNow;
            invitation.EmailError = null;
        }
        else
        {
            invitation.EmailStatus = EmailSendStatus.Failed;
            invitation.EmailError = emailResult.Error;
        }

        await _context.SaveChangesAsync(cancellationToken);

        // Audit log the invitation creation (includes email outcome).
        var actor = await _userLookup.FindByIdAsync(currentUser.UserId, cancellationToken);
        await _auditLogService.CreateAsync(new AuditLogEntry
        {
            Type = AuditLogType.OrganizationMemberAdded,
            OrganizationId = request.OrganizationId,
            ActorId = currentUser.UserId,
            ActorName = actor?.FullName ?? "Unknown",
            TargetEntityId = invitation.Id,
            TargetEntityType = "OrganizationInvitation",
            Action = "InvitationSent",
            Description = $"Sent invitation to {request.Email} with role {request.Role}. Email: {invitation.EmailStatus}.",
            OldValuesJson = "{}",
            NewValuesJson = JsonSerializer.Serialize(new
            {
                Email = request.Email,
                Role = request.Role.ToString(),
                EmailStatus = invitation.EmailStatus,
            }),
            IsSensitive = false,
        }, cancellationToken);

        return new CreateInvitationResponse
        {
            Id = invitation.Id,
            Email = invitation.Email,
            Role = invitation.Role,
            Token = invitation.Token,
            ExpiresAt = invitation.ExpiresAt,
            EmailStatus = invitation.EmailStatus,
            EmailError = invitation.EmailStatus == EmailSendStatus.Failed
                ? "Invitation created, but the invitation email could not be delivered. Use resend to retry."
                : null,
        };
    }

    private async Task<EmailSendResult> SendInvitationEmailAsync(
        CreateInvitationCommand request,
        OrganizationInvitation invitation,
        CancellationToken cancellationToken)
    {
        var org = await _context.Organizations
            .AsNoTracking()
            .FirstOrDefaultAsync(o => o.Id == request.OrganizationId, cancellationToken);

        if (org is null)
        {
            return new EmailSendResult
            {
                Success = false,
                Error = "Organization not found.",
                ErrorCode = "organization_not_found",
            };
        }

        var configuredFrontendBaseUrl = _configuration["Frontend:BaseUrl"];
        var frontendBaseUrl = string.IsNullOrWhiteSpace(configuredFrontendBaseUrl)
            ? "https://flowforge-app.runasp.net"
            : configuredFrontendBaseUrl.Trim().TrimEnd('/');
        var invitationLink = $"{frontendBaseUrl}/accept-invitation?token={invitation.Token}";

        var actor = await _userLookup.FindByIdAsync(invitation.InvitedByUserId, cancellationToken);

        return await _emailService.SendInvitationEmailAsync(
            request.Email,
            org.Name,
            actor?.FullName ?? "Unknown",
            request.Role.ToString(),
            invitationLink,
            invitation.ExpiresAt,
            request.Message,
            cancellationToken);
    }

    private static string GenerateSecureToken()
    {
        var bytes = new byte[32];
        using var rng = System.Security.Cryptography.RandomNumberGenerator.Create();
        rng.GetBytes(bytes);
        return Convert.ToBase64String(bytes)
            .TrimEnd('=')
            .Replace('+', '-')
            .Replace('/', '_');
    }

    private static string NormalizeEmail(string email) =>
        (email ?? string.Empty).Trim().ToLowerInvariant();

    /// <summary>
    /// Masks an email for safe logging (e.g. "j****e@***"). Never logs full
    /// email addresses or invitation tokens.
    /// </summary>
    private static string MaskEmail(string email)
    {
        if (string.IsNullOrEmpty(email))
        {
            return "<empty>";
        }

        var at = email.IndexOf('@');
        if (at <= 0)
        {
            return "***";
        }

        var local = email[..at];
        var domain = email[(at + 1)..];

        var maskedLocal = local.Length <= 2
            ? new string('*', local.Length)
            : local[0] + new string('*', local.Length - 2) + local[^1];

        return $"{maskedLocal}@{domain}";
    }
}
