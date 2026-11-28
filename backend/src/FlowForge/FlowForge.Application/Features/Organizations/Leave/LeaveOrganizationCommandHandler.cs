using FlowForge.Application.Common.Exceptions;
using FlowForge.Application.Features.Authentication.CurrentUser;
using FlowForge.Application.Features.Organizations;
using FlowForge.Application.Interfaces;
using FlowForge.Application.Services.AuditLogs;
using FlowForge.Application.Services.Authentication;
using FlowForge.Application.Services.Organizations;
using FlowForge.Application.Services.Realtime;
using FlowForge.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FlowForge.Application.Features.Organizations.Leave;

public sealed class LeaveOrganizationCommandHandler(
    IApplicationDbContext context,
    ICurrentUserService currentUser,
    OrganizationRules rules,
    IAuditLogService auditLogService,
    IOrganizationSessionService sessionService,
    IRealtimeNotifier realtimeNotifier)
    : IRequestHandler<LeaveOrganizationCommand, OrganizationSessionResponse>
{
    public async Task<OrganizationSessionResponse> Handle(
        LeaveOrganizationCommand request,
        CancellationToken cancellationToken)
    {
        var user = currentUser.User;
        await rules.GetSessionOrganizationAsync(request.OrganizationId, user, cancellationToken);

        var membership = await context.OrganizationUsers
            .FirstAsync(
                x => x.UserId == user.UserId &&
                     x.OrganizationId == request.OrganizationId &&
                     !x.IsDeleted,
                cancellationToken);

        if (membership.IsOwner)
            throw new BadRequestException("Transfer ownership before leaving the organization.");

        if (membership.Role == UserRole.Admin)
        {
            var adminCount = await context.OrganizationUsers
                .CountAsync(
                    x => x.OrganizationId == request.OrganizationId &&
                         x.Role == UserRole.Admin &&
                         !x.IsDeleted,
                    cancellationToken);

            if (adminCount <= 1)
                throw new BadRequestException("Cannot leave as the last admin.");
        }

        await context.ExecuteInTransactionAsync(async () =>
        {
            membership.SoftDelete(user.UserId);
            await context.SaveChangesAsync(cancellationToken);

            await auditLogService.CreateAsync(new AuditLogEntry
            {
                Type = AuditLogType.OrganizationLeft,
                OrganizationId = request.OrganizationId,
                ActorId = user.UserId,
                ActorName = user.FullName,
                TargetEntityId = membership.Id,
                TargetEntityType = "OrganizationUser",
                Action = "OrganizationLeft",
                Description = "Left the organization."
            }, cancellationToken);
        }, cancellationToken);

        await realtimeNotifier.NotifyUserAsync(
            user.UserId,
            "MembershipChanged",
            new { OrganizationId = request.OrganizationId, Action = "left" },
            cancellationToken);

        return await sessionService.IssueAsync(user, null, cancellationToken);
    }
}
