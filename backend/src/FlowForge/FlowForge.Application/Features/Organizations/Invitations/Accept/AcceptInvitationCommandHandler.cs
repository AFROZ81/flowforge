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
    private readonly ICurrentUserService _currentUser;

    public AcceptInvitationCommandHandler(
        IApplicationDbContext context,
        IUserLookupService userLookup,
        ITokenService tokenService,
        IAuditLogService auditLogService,
        ICurrentUserService currentUser)
    {
        _context = context;
        _userLookup = userLookup;
        _tokenService = tokenService;
        _auditLogService = auditLogService;
        _currentUser = currentUser;
    }

    public async Task<AcceptInvitationResponse> Handle(AcceptInvitationCommand request, CancellationToken cancellationToken)
    {
        var invitation = await _context.OrganizationInvitations
            .Include(i => i.Organization)
            .FirstOrDefaultAsync(i => i.Token == request.Token && !i.IsDeleted, cancellationToken);

        if (invitation is null)
            throw new NotFoundException("Invalid or expired invitation token.");

        if (invitation.IsAccepted)
            throw new BadRequestException("This invitation has already been accepted.");

        if (invitation.ExpiresAt < DateTime.UtcNow)
            throw new BadRequestException("This invitation has expired.");

        if (!invitation.Organization.IsActive || invitation.Organization.IsDeleted)
            throw new BadRequestException("This invitation's organization is not active.");

        var userId = request.AcceptingUserId
            ?? _currentUser.TryGetUser()?.UserId
            ?? throw new UnauthorizedAccessException("User is not authenticated.");

        var user = await _userLookup.FindByIdAsync(userId, cancellationToken)
            ?? throw new NotFoundException("User not found.");

        if (!string.Equals(
                invitation.Email.Trim(),
                user.Email,
                StringComparison.OrdinalIgnoreCase))
        {
            throw new BadRequestException("Registration email must match the invited email address.");
        }

        var activeMembership = await _context.OrganizationUsers
            .AsNoTracking()
            .AnyAsync(
                x => x.UserId == userId &&
                     x.OrganizationId == invitation.OrganizationId &&
                     !x.IsDeleted,
                cancellationToken);

        if (activeMembership)
            throw new ConflictException("User is already a member of this organization.");

        var membership = await _context.OrganizationUsers
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(
                x => x.UserId == userId && x.OrganizationId == invitation.OrganizationId,
                cancellationToken);

        membership ??= new OrganizationUser
        {
            UserId = userId,
            OrganizationId = invitation.OrganizationId
        };

        await _context.ExecuteInTransactionAsync(async () =>
        {
            if (membership.IsDeleted)
            {
                _context.OrganizationUsers.Update(membership);
                membership.RestoreMembership(invitation.Role, userId);
            }
            else
            {
                membership.ChangeRole(invitation.Role, userId);
                _context.OrganizationUsers.Add(membership);
            }

            invitation.IsAccepted = true;
            invitation.AcceptedAt = DateTime.UtcNow;
            invitation.AcceptedByUserId = userId;
            invitation.UpdatedAt = DateTime.UtcNow;
            invitation.UpdatedBy = userId;

            await _context.SaveChangesAsync(cancellationToken);

            await _auditLogService.CreateAsync(new AuditLogEntry
            {
                Type = AuditLogType.InvitationAccepted,
                OrganizationId = invitation.OrganizationId,
                ActorId = userId,
                ActorName = user.FullName,
                TargetEntityId = invitation.Id,
                TargetEntityType = "OrganizationInvitation",
                Action = "InvitationAccepted",
                Description = $"Accepted invitation for {invitation.Email} with role {invitation.Role}",
                OldValuesJson = "{}",
                NewValuesJson = JsonSerializer.Serialize(new
                {
                    Email = invitation.Email,
                    Role = invitation.Role.ToString()
                }),
                IsSensitive = false
            }, cancellationToken);
        }, cancellationToken);

        var organizationIds = await _context.OrganizationUsers
            .AsNoTracking()
            .Where(x => x.UserId == userId &&
                        !x.IsDeleted &&
                        x.Organization.IsActive &&
                        !x.Organization.IsDeleted)
            .Select(x => x.OrganizationId)
            .Distinct()
            .ToListAsync(cancellationToken);

        var acceptedMembership = await _context.OrganizationUsers
            .AsNoTracking()
            .FirstAsync(
                x => x.UserId == userId &&
                     x.OrganizationId == invitation.OrganizationId &&
                     !x.IsDeleted,
                cancellationToken);

        var token = _tokenService.GenerateAccessToken(new AuthenticatedUser
        {
            UserId = userId,
            Email = user.Email,
            FullName = user.FullName,
            OrganizationId = invitation.OrganizationId,
            MembershipId = acceptedMembership.Id,
            TokenVersion = acceptedMembership.TokenVersion,
            OrganizationIds = organizationIds,
            Role = acceptedMembership.Role
        });

        return new AcceptInvitationResponse
        {
            UserId = userId,
            AccessToken = token.AccessToken,
            ExpiresAtUtc = token.ExpiresAtUtc
        };
    }
}
