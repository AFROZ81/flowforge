using FlowForge.Application.Common.Exceptions;
using FlowForge.Application.Features.Organizations.Members.Remove;
using FlowForge.Application.Interfaces;
using FlowForge.Application.Services.Authentication;
using FlowForge.Application.Services.AuditLogs;
using FlowForge.Application.Services.Realtime;
using FlowForge.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace FlowForge.Application.Features.Organizations.Members.Remove;

/// <summary>
/// Handles <see cref="RemoveMemberCommand"/>.
/// </summary>
public sealed class RemoveMemberCommandHandler : IRequestHandler<RemoveMemberCommand>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly IUserLookupService _userLookup;
    private readonly IAuditLogService _auditLogService;
    private readonly IRealtimeNotifier _realtimeNotifier;

    public RemoveMemberCommandHandler(IApplicationDbContext context, ICurrentUserService currentUser, IUserLookupService userLookup, IAuditLogService auditLogService, IRealtimeNotifier realtimeNotifier)
    {
        _context = context;
        _currentUser = currentUser;
        _userLookup = userLookup;
        _auditLogService = auditLogService;
        _realtimeNotifier = realtimeNotifier;
    }

    public async Task Handle(RemoveMemberCommand request, CancellationToken cancellationToken)
    {
        var currentUser = _currentUser.User;

        if (request.OrganizationId != currentUser.OrganizationId)
            throw new NotFoundException("Organization not found.");

        // Check if user is admin of the organization
        var isAdmin = await _context.OrganizationUsers
            .AsNoTracking()
            .AnyAsync(
                ou => ou.UserId == currentUser.UserId &&
                      ou.OrganizationId == request.OrganizationId &&
                      ou.Role == UserRole.Admin &&
                      !ou.IsDeleted,
                cancellationToken);

        if (!isAdmin)
        {
            throw new ForbiddenException("Only organization admins can remove members.");
        }

        // Prevent self-removal
        if (request.TargetUserId == currentUser.UserId)
        {
            throw new BadRequestException("You cannot remove yourself from the organization.");
        }

        // Get the target member
        var targetMember = await _context.OrganizationUsers
            .FirstOrDefaultAsync(
                ou => ou.UserId == request.TargetUserId &&
                      ou.OrganizationId == request.OrganizationId,
                cancellationToken);

        if (targetMember is null)
        {
            throw new NotFoundException("Member not found in this organization.");
        }

        if (targetMember.IsOwner)
        {
            throw new BadRequestException("The organization owner cannot be removed.");
        }

        // Check if target is the last admin
        if (targetMember.Role == UserRole.Admin)
        {
            var adminCount = await _context.OrganizationUsers
                .AsNoTracking()
                .CountAsync(
                    ou => ou.OrganizationId == request.OrganizationId &&
                          ou.Role == UserRole.Admin,
                    cancellationToken);

            if (adminCount <= 1)
            {
                throw new BadRequestException("Cannot remove the last admin from the organization.");
            }
        }

        await _context.ExecuteInTransactionAsync(async () =>
        {
            targetMember.SoftDelete(currentUser.UserId);
            await _context.SaveChangesAsync(cancellationToken);

            await _auditLogService.CreateAsync(new AuditLogEntry
            {
                Type = AuditLogType.OrganizationMemberRemoved,
                OrganizationId = request.OrganizationId,
                ActorId = currentUser.UserId,
                ActorName = currentUser.FullName,
                TargetEntityId = request.TargetUserId,
                TargetEntityType = "OrganizationUser",
                Action = "MemberRemoved",
                Description = $"Removed member from organization (role: {targetMember.Role}).",
                OldValuesJson = JsonSerializer.Serialize(new { Role = targetMember.Role.ToString() }),
                NewValuesJson = "{}",
                IsSensitive = false
            }, cancellationToken);
        }, cancellationToken);

        await _realtimeNotifier.NotifyUserAsync(
            request.TargetUserId,
            "MembershipChanged",
            new { OrganizationId = request.OrganizationId, Action = "removed" },
            cancellationToken);
    }
}