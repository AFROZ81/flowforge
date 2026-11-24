using FlowForge.Application.Common.Exceptions;
using FlowForge.Application.Features.Organizations.Invitations.Resend;
using FlowForge.Application.Interfaces;
using FlowForge.Application.Services;
using FlowForge.Application.Services.Authentication;
using FlowForge.Application.Services.Organizations;
using FlowForge.Domain.Entities;
using FlowForge.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace FlowForge.Application.Features.Organizations.Invitations.Resend;

/// <summary>
/// Handles <see cref="ResendInvitationCommand"/>.
///
/// Resending rotates the token and extends expiration, then attempts delivery
/// again. A cooldown prevents rapid-fire resends; email failures are tracked on
/// the invitation without creating a duplicate record.
/// </summary>
public sealed class ResendInvitationCommandHandler : IRequestHandler<ResendInvitationCommand>
{
    private const int ResendCooldownMinutes = 5;

    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly IEmailService _emailService;
    private readonly IUserLookupService _userLookup;
    private readonly IConfiguration _configuration;

    public ResendInvitationCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser,
        IEmailService emailService,
        IUserLookupService userLookup,
        IConfiguration configuration)
    {
        _context = context;
        _currentUser = currentUser;
        _emailService = emailService;
        _userLookup = userLookup;
        _configuration = configuration;
    }

    public async Task Handle(ResendInvitationCommand request, CancellationToken cancellationToken)
    {
        var currentUser = _currentUser.User;

        var invitation = await _context.OrganizationInvitations
            .FirstOrDefaultAsync(i => i.Id == request.Id && !i.IsDeleted, cancellationToken);

        if (invitation is null)
        {
            throw new NotFoundException("Invitation not found.");
        }

        // Only organization admins can resend invitations.
        var isAdmin = await _context.OrganizationUsers
            .AsNoTracking()
            .AnyAsync(
                ou => ou.UserId == currentUser.UserId &&
                      ou.OrganizationId == invitation.OrganizationId &&
                      ou.Role == UserRole.Admin,
                cancellationToken);

        if (!isAdmin)
        {
            throw new ForbiddenException("Only organization admins can resend invitations.");
        }

        if (invitation.IsAccepted)
        {
            throw new BadRequestException("Cannot resend an already accepted invitation.");
        }

        if (invitation.ExpiresAt < DateTime.UtcNow)
        {
            throw new BadRequestException("Cannot resend an expired invitation. Create a new one instead.");
        }

        // Resend cooldown: do not re-send email too frequently for the same invite.
        if (invitation.LastEmailSendAt is var lastSend && lastSend is not null &&
            DateTime.UtcNow - lastSend.Value < TimeSpan.FromMinutes(ResendCooldownMinutes))
        {
            var remaining = ResendCooldownMinutes - (int)(DateTime.UtcNow - lastSend.Value).TotalMinutes;
            throw new ConflictException(
                $"Invitation email was recently sent. Please wait {remaining} minute(s) before resending.");
        }

        // Rotate token and extend expiration per existing business rules.
        invitation.ExpiresAt = DateTime.UtcNow.AddDays(7);
        invitation.Token = GenerateSecureToken();
        invitation.EmailAttempts++;
        invitation.LastEmailSendAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        // Attempt delivery. Track status on the invitation so the admin can
        // distinguish success from failure without creating a duplicate invite.
        var emailResult = await SendInvitationEmailAsync(invitation, cancellationToken);

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
    }

    private async Task<EmailSendResult> SendInvitationEmailAsync(
        OrganizationInvitation invitation,
        CancellationToken cancellationToken)
    {
        var org = await _context.Organizations
            .AsNoTracking()
            .FirstOrDefaultAsync(o => o.Id == invitation.OrganizationId, cancellationToken);

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
            invitation.Email,
            org.Name,
            actor?.FullName ?? "Unknown",
            invitation.Role.ToString(),
            invitationLink,
            invitation.ExpiresAt,
            null,
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
}
