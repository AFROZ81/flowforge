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

namespace FlowForge.Application.Features.Organizations.Delete;

public sealed class DeleteOrganizationCommandHandler(
    IApplicationDbContext context,
    ICurrentUserService currentUser,
    OrganizationRules rules,
    IAuditLogService auditLogService,
    IOrganizationSessionService sessionService,
    IRealtimeNotifier realtimeNotifier)
    : IRequestHandler<DeleteOrganizationCommand, OrganizationSessionResponse>
{
    public async Task<OrganizationSessionResponse> Handle(
        DeleteOrganizationCommand request,
        CancellationToken cancellationToken)
    {
        var user = currentUser.TryGetUser()
            ?? throw new UnauthorizedAccessException("User is not authenticated.");

        var organization = await rules.GetOwnedOrganizationAsync(
            request.OrganizationId,
            user.UserId,
            cancellationToken);

        if (organization.IsActive)
            throw new BadRequestException("Archive the organization before deleting it.");

        if (!string.Equals(
                request.ConfirmationSlug.Trim(),
                organization.Slug,
                StringComparison.OrdinalIgnoreCase))
        {
            throw new BadRequestException("Type the organization slug to confirm deletion.");
        }

        var trackedOrganization = await context.Organizations
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
            trackedOrganization.SoftDelete(user.UserId);

            foreach (var member in memberships)
                member.SoftDelete(user.UserId);

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
                Type = AuditLogType.OrganizationDeleted,
                OrganizationId = trackedOrganization.Id,
                ActorId = user.UserId,
                ActorName = user.FullName,
                TargetEntityId = trackedOrganization.Id,
                TargetEntityType = "Organization",
                Action = "OrganizationDeleted",
                Description = $"Soft-deleted organization {trackedOrganization.Name}.",
                IsSensitive = true
            }, cancellationToken);
        }, cancellationToken);

        foreach (var member in memberships)
        {
            await realtimeNotifier.NotifyUserAsync(
                member.UserId,
                "MembershipChanged",
                new { OrganizationId = trackedOrganization.Id, Action = "deleted" },
                cancellationToken);
        }

        return await sessionService.IssueAsync(user, null, cancellationToken);
    }
}
