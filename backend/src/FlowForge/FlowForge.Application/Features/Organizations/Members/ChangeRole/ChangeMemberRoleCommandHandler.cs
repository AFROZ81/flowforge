using FlowForge.Application.Common.Exceptions;
using FlowForge.Application.Features.Organizations.Members.ChangeRole;
using FlowForge.Application.Interfaces;
using FlowForge.Application.Services.Authentication;
using FlowForge.Application.Services.AuditLogs;
using FlowForge.Application.Services.Realtime;
using FlowForge.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace FlowForge.Application.Features.Organizations.Members.ChangeRole;

/// <summary>
/// Handles <see cref="ChangeMemberRoleCommand"/>.
/// </summary>
public sealed class ChangeMemberRoleCommandHandler : IRequestHandler<ChangeMemberRoleCommand, ChangeMemberRoleResponse>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly IUserLookupService _userLookup;
    private readonly IRealtimeNotifier _realtimeNotifier;
    private readonly IAuditLogService _auditLogService;

    public ChangeMemberRoleCommandHandler(IApplicationDbContext context, ICurrentUserService currentUser, IUserLookupService userLookup, IRealtimeNotifier realtimeNotifier, IAuditLogService auditLogService)
    {
        _context = context;
        _currentUser = currentUser;
        _userLookup = userLookup;
        _realtimeNotifier = realtimeNotifier;
        _auditLogService = auditLogService;
    }

    public async Task<ChangeMemberRoleResponse> Handle(ChangeMemberRoleCommand request, CancellationToken cancellationToken)
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
            throw new ForbiddenException("Only organization admins can change member roles.");
        }

        // Prevent self-role change
        if (request.TargetUserId == currentUser.UserId)
        {
            throw new BadRequestException("You cannot change your own role.");
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
            throw new BadRequestException("The organization owner cannot be demoted.");
        }

        // Check if target is the last admin
        if (targetMember.Role == UserRole.Admin && request.Role != UserRole.Admin)
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

        var oldRole = targetMember.Role;

        await _context.ExecuteInTransactionAsync(async () =>
        {
            targetMember.ChangeRole(request.Role, currentUser.UserId);
            await _context.SaveChangesAsync(cancellationToken);

            await _auditLogService.CreateAsync(new AuditLogEntry
            {
                Type = AuditLogType.OrganizationMemberRoleChanged,
                OrganizationId = request.OrganizationId,
                ActorId = currentUser.UserId,
                ActorName = currentUser.FullName,
                TargetEntityId = request.TargetUserId,
                TargetEntityType = "OrganizationUser",
                Action = "RoleChanged",
                Description = $"Changed member role from {oldRole} to {request.Role}.",
                OldValuesJson = JsonSerializer.Serialize(new { Role = oldRole.ToString() }),
                NewValuesJson = JsonSerializer.Serialize(new { Role = request.Role.ToString() }),
                IsSensitive = false
            }, cancellationToken);
        }, cancellationToken);

        // Notify the affected user of the role change via SignalR
        await _realtimeNotifier.NotifyRoleChangedAsync(
            request.TargetUserId,
            request.OrganizationId,
            request.Role,
            cancellationToken);

        return new ChangeMemberRoleResponse
        {
            UserId = request.TargetUserId,
            Role = request.Role,
            UpdatedAt = targetMember.UpdatedAt ?? DateTime.UtcNow
        };
    }
}