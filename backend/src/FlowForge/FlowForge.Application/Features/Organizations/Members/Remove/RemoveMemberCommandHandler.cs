using FlowForge.Application.Common.Exceptions;
using FlowForge.Application.Features.Organizations.Members.Remove;
using FlowForge.Application.Interfaces;
using FlowForge.Application.Services.Authentication;
using FlowForge.Application.Services.AuditLogs;
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

    public RemoveMemberCommandHandler(IApplicationDbContext context, ICurrentUserService currentUser, IUserLookupService userLookup, IAuditLogService auditLogService)
    {
        _context = context;
        _currentUser = currentUser;
        _userLookup = userLookup;
        _auditLogService = auditLogService;
    }

    public async Task Handle(RemoveMemberCommand request, CancellationToken cancellationToken)
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

        _context.OrganizationUsers.Remove(targetMember);
        await _context.SaveChangesAsync(cancellationToken);

        // Audit log the member removal
        var actor = await _userLookup.FindByIdAsync(currentUser.UserId, cancellationToken);
        var target = await _userLookup.FindByIdAsync(request.TargetUserId, cancellationToken);

        await _auditLogService.CreateAsync(new AuditLogEntry
        {
            Type = AuditLogType.OrganizationMemberRemoved,
            OrganizationId = request.OrganizationId,
            ActorId = currentUser.UserId,
            ActorName = actor?.FullName ?? "Unknown",
            TargetEntityId = request.TargetUserId,
            TargetEntityType = "OrganizationUser",
            Action = "MemberRemoved",
            Description = $"Removed member {target?.FullName ?? target?.Email ?? "user"} (role: {targetMember.Role}) from organization",
            OldValuesJson = JsonSerializer.Serialize(new { Role = targetMember.Role.ToString() }),
            NewValuesJson = "{}",
            IsSensitive = false
        }, cancellationToken);
    }
}