using FlowForge.Application.Common.Exceptions;
using FlowForge.Application.Features.Authentication.CurrentUser;
using FlowForge.Application.Features.Organizations.Invitations.Accept;
using FlowForge.Application.Interfaces;
using FlowForge.Application.Services.Authentication;
using FlowForge.Application.Services.AuditLogs;
using FlowForge.Domain.Entities;
using FlowForge.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace FlowForge.Application.Features.Organizations.Invitations.Accept;

/// <summary>
/// Handles <see cref="AcceptInvitationCommand"/>.
/// </summary>
public sealed class AcceptInvitationCommandHandler : IRequestHandler<AcceptInvitationCommand, AcceptInvitationResponse>
{
    private readonly IApplicationDbContext _context;
    private readonly IUserLookupService _userLookup;
    private readonly ITokenService _tokenService;
    private readonly IAuditLogService _auditLogService;

    public AcceptInvitationCommandHandler(IApplicationDbContext context, IUserLookupService userLookup, ITokenService tokenService, IAuditLogService auditLogService)
    {
        _context = context;
        _userLookup = userLookup;
        _tokenService = tokenService;
        _auditLogService = auditLogService;
    }

    public async Task<AcceptInvitationResponse> Handle(AcceptInvitationCommand request, CancellationToken cancellationToken)
    {
        var invitation = await _context.OrganizationInvitations
            .FirstOrDefaultAsync(i => i.Token == request.Token && !i.IsDeleted, cancellationToken);

        if (invitation is null)
            throw new NotFoundException("Invalid or expired invitation token.");

        if (invitation.IsAccepted)
            throw new BadRequestException("This invitation has already been accepted.");

        if (invitation.ExpiresAt < DateTime.UtcNow)
            throw new BadRequestException("This invitation has expired.");

        var user = await _userLookup.FindByEmailAsync(invitation.Email, cancellationToken);

        if (user is null)
        {
            throw new BadRequestException("Please register an account first, then accept the invitation.");
        }

        // Check if user is already a member
        var isMember = await _context.OrganizationUsers
            .AsNoTracking()
            .AnyAsync(
                ou => ou.UserId == user.Id && ou.OrganizationId == invitation.OrganizationId,
                cancellationToken);

        if (isMember)
            throw new ConflictException("User is already a member of this organization.");

        // Create the organization user link
        var orgUser = new OrganizationUser
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            OrganizationId = invitation.OrganizationId,
            Role = invitation.Role
        };

        _context.OrganizationUsers.Add(orgUser);

        // Mark invitation as accepted
        invitation.IsAccepted = true;
        invitation.AcceptedAt = DateTime.UtcNow;
        invitation.AcceptedByUserId = user.Id;

        await _context.SaveChangesAsync(cancellationToken);

        // Audit log the invitation acceptance
        var actor = await _userLookup.FindByIdAsync(user.Id, cancellationToken);

        await _auditLogService.CreateAsync(new AuditLogEntry
        {
            Type = AuditLogType.InvitationAccepted,
            OrganizationId = invitation.OrganizationId,
            ActorId = user.Id,
            ActorName = actor?.FullName ?? "Unknown",
            TargetEntityId = invitation.Id,
            TargetEntityType = "OrganizationInvitation",
            Action = "InvitationAccepted",
            Description = $"Accepted invitation for {invitation.Email} with role {invitation.Role}",
            OldValuesJson = "{}",
            NewValuesJson = JsonSerializer.Serialize(new { Email = invitation.Email, Role = invitation.Role.ToString() }),
            IsSensitive = false
        }, cancellationToken);

        // Generate new token with updated organization and role
        var organizationIds = await _context.OrganizationUsers
            .AsNoTracking()
            .Where(ou => ou.UserId == user.Id)
            .Select(ou => ou.OrganizationId)
            .ToListAsync(cancellationToken);

        var orgUserResult = await _context.OrganizationUsers
            .AsNoTracking()
            .FirstOrDefaultAsync(ou => ou.UserId == user.Id && ou.OrganizationId == invitation.OrganizationId, cancellationToken);

        var authenticatedUser = new AuthenticatedUser
        {
            UserId = user.Id,
            Email = user.Email,
            FullName = user.FullName,
            OrganizationId = invitation.OrganizationId,
            OrganizationIds = organizationIds,
            Role = invitation.Role
        };

        var token = _tokenService.GenerateAccessToken(authenticatedUser);

        return new AcceptInvitationResponse
        {
            UserId = user.Id,
            AccessToken = token.AccessToken,
            ExpiresAtUtc = token.ExpiresAtUtc
        };
    }
}