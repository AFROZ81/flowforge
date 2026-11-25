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

        // Check if user is admin of the organization
        var isAdmin = await _context.OrganizationUsers
            .AsNoTracking()
            .AnyAsync(
                ou => ou.UserId == currentUser.UserId &&
                      ou.OrganizationId == request.OrganizationId &&
                      ou.Role == UserRole.Admin,
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
        targetMember.ChangeRole(request.Role, currentUser.UserId);

        await _context.SaveChangesAsync(cancellationToken);

        // Notify the affected user of the role change via SignalR
        await _realtimeNotifier.NotifyRoleChangedAsync(
            request.TargetUserId,
            request.OrganizationId,
            request.Role,
            cancellationToken);

        // Audit log the role change
        var actor = await _userLookup.FindByIdAsync(currentUser.UserId, cancellationToken);
        var target = await _userLookup.FindByIdAsync(request.TargetUserId, cancellationToken);

        await _auditLogService.CreateAsync(new AuditLogEntry
        {
            Type = AuditLogType.OrganizationMemberRoleChanged,
            OrganizationId = request.OrganizationId,
            ActorId = currentUser.UserId,
            ActorName = actor?.FullName ?? "Unknown",
            TargetEntityId = request.TargetUserId,
            TargetEntityType = "OrganizationUser",
            Action = "RoleChanged",
            Description = $"Changed role of {target?.FullName ?? target?.Email ?? "user"} from {oldRole} to {request.Role}",
            OldValuesJson = JsonSerializer.Serialize(new { Role = oldRole.ToString() }),
            NewValuesJson = JsonSerializer.Serialize(new { Role = request.Role.ToString() }),
            IsSensitive = false
        }, cancellationToken);

        return new ChangeMemberRoleResponse
        {
            UserId = request.TargetUserId,
            Role = request.Role,
            UpdatedAt = targetMember.UpdatedAt ?? DateTime.UtcNow
        };
    }
}