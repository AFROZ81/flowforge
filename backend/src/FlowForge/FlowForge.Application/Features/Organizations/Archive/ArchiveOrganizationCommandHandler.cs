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

namespace FlowForge.Application.Features.Organizations.Archive;

public sealed class ArchiveOrganizationCommandHandler(
    IApplicationDbContext context,
    ICurrentUserService currentUser,
    OrganizationRules rules,
    IAuditLogService auditLogService,
    IOrganizationSessionService sessionService,
    IRealtimeNotifier realtimeNotifier)
    : IRequestHandler<ArchiveOrganizationCommand, OrganizationSessionResponse>
{
    public async Task<OrganizationSessionResponse> Handle(
        ArchiveOrganizationCommand request,
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

        if (!membership.IsOwner)
            throw new ForbiddenException("Only the organization owner can archive it.");

        var organization = await context.Organizations
            .FirstAsync(x => x.Id == request.OrganizationId, cancellationToken);

        var memberships = await context.OrganizationUsers
            .Where(x => x.OrganizationId == request.OrganizationId && !x.IsDeleted)
            .ToListAsync(cancellationToken);

        var invitations = await context.OrganizationInvitations
            .Where(x => x.OrganizationId == request.OrganizationId &&
                        !x.IsDeleted &&
                        !x.IsAccepted)
            .ToListAsync(cancellationToken);

        await context.ExecuteInTransactionAsync(async () =>
        {
            organization.Archive(user.UserId);

            foreach (var member in memberships)
                member.InvalidateSession(user.UserId);

            foreach (var invitation in invitations)
            {
                invitation.IsDeleted = true;
                invitation.DeletedAt = DateTime.UtcNow;
                invitation.UpdatedAt = DateTime.UtcNow;
                invitation.UpdatedBy = user.UserId;
            }

            await context.SaveChangesAsync(cancellationToken);

            await auditLogService.CreateAsync(new AuditLogEntry
            {
                Type = AuditLogType.OrganizationArchived,
                OrganizationId = organization.Id,
                ActorId = user.UserId,
                ActorName = user.FullName,
                TargetEntityId = organization.Id,
                TargetEntityType = "Organization",
                Action = "OrganizationArchived",
                Description = $"Archived organization {organization.Name}."
            }, cancellationToken);
        }, cancellationToken);

        foreach (var member in memberships)
        {
            await realtimeNotifier.NotifyUserAsync(
                member.UserId,
                "MembershipChanged",
                new { OrganizationId = organization.Id, Action = "archived" },
                cancellationToken);
        }

        return await sessionService.IssueAsync(user, null, cancellationToken);
    }
}
