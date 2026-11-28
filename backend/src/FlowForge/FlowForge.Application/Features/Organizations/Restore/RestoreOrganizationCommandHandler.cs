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

namespace FlowForge.Application.Features.Organizations.Restore;

public sealed class RestoreOrganizationCommandHandler(
    IApplicationDbContext context,
    ICurrentUserService currentUser,
    OrganizationRules rules,
    IAuditLogService auditLogService,
    IOrganizationSessionService sessionService,
    IRealtimeNotifier realtimeNotifier)
    : IRequestHandler<RestoreOrganizationCommand, OrganizationSessionResponse>
{
    public async Task<OrganizationSessionResponse> Handle(
        RestoreOrganizationCommand request,
        CancellationToken cancellationToken)
    {
        var user = currentUser.TryGetUser()
            ?? throw new UnauthorizedAccessException("User is not authenticated.");

        await rules.GetOwnedOrganizationAsync(
            request.OrganizationId,
            user.UserId,
            cancellationToken);

        var organization = await context.Organizations
            .FirstAsync(x => x.Id == request.OrganizationId, cancellationToken);

        if (organization.IsActive)
            throw new BadRequestException("Organization is already active.");

        var memberships = await context.OrganizationUsers
            .Where(x => x.OrganizationId == request.OrganizationId && !x.IsDeleted)
            .ToListAsync(cancellationToken);

        var invitations = await context.OrganizationInvitations
            .IgnoreQueryFilters()
            .Where(x => x.OrganizationId == request.OrganizationId &&
                        x.IsDeleted &&
                        !x.IsAccepted &&
                        x.ExpiresAt > DateTime.UtcNow)
            .ToListAsync(cancellationToken);

        await context.ExecuteInTransactionAsync(async () =>
        {
            organization.Restore(user.UserId);

            foreach (var member in memberships)
                member.InvalidateSession(user.UserId);

            foreach (var invitation in invitations)
            {
                invitation.RestoreDeleted();
                invitation.UpdatedAt = DateTime.UtcNow;
                invitation.UpdatedBy = user.UserId;
            }

            await context.SaveChangesAsync(cancellationToken);

            await auditLogService.CreateAsync(new AuditLogEntry
            {
                Type = AuditLogType.OrganizationRestored,
                OrganizationId = organization.Id,
                ActorId = user.UserId,
                ActorName = user.FullName,
                TargetEntityId = organization.Id,
                TargetEntityType = "Organization",
                Action = "OrganizationRestored",
                Description = $"Restored organization {organization.Name}."
            }, cancellationToken);
        }, cancellationToken);

        foreach (var member in memberships)
        {
            await realtimeNotifier.NotifyUserAsync(
                member.UserId,
                "MembershipChanged",
                new { OrganizationId = organization.Id, Action = "restored" },
                cancellationToken);
        }

        return await sessionService.IssueAsync(
            user,
            request.OrganizationId,
            cancellationToken);
    }
}
