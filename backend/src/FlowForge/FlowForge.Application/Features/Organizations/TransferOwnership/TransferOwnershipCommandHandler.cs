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

namespace FlowForge.Application.Features.Organizations.TransferOwnership;

public sealed class TransferOwnershipCommandHandler(
    IApplicationDbContext context,
    ICurrentUserService currentUser,
    OrganizationRules rules,
    IAuditLogService auditLogService,
    IOrganizationSessionService sessionService,
    IRealtimeNotifier realtimeNotifier)
    : IRequestHandler<TransferOwnershipCommand, OrganizationSessionResponse>
{
    public async Task<OrganizationSessionResponse> Handle(
        TransferOwnershipCommand request,
        CancellationToken cancellationToken)
    {
        var user = currentUser.User;
        await rules.GetSessionOrganizationAsync(request.OrganizationId, user, cancellationToken);

        if (request.TargetUserId == user.UserId)
            throw new BadRequestException("Choose a different member to receive ownership.");

        var currentMembership = await context.OrganizationUsers
            .FirstAsync(
                x => x.UserId == user.UserId &&
                     x.OrganizationId == request.OrganizationId &&
                     !x.IsDeleted,
                cancellationToken);

        if (!currentMembership.IsOwner)
            throw new ForbiddenException("Only the organization owner can transfer ownership.");

        var targetMembership = await context.OrganizationUsers
            .FirstOrDefaultAsync(
                x => x.UserId == request.TargetUserId &&
                     x.OrganizationId == request.OrganizationId &&
                     !x.IsDeleted,
                cancellationToken)
            ?? throw new NotFoundException("Target member not found.");

        await context.ExecuteInTransactionAsync(async () =>
        {
            targetMembership.ChangeRole(UserRole.Admin, user.UserId);
            targetMembership.ChangeOwnership(true, user.UserId);
            currentMembership.ChangeOwnership(false, user.UserId);

            await context.SaveChangesAsync(cancellationToken);

            await auditLogService.CreateAsync(new AuditLogEntry
            {
                Type = AuditLogType.OwnershipTransferred,
                OrganizationId = request.OrganizationId,
                ActorId = user.UserId,
                ActorName = user.FullName,
                TargetEntityId = request.TargetUserId,
                TargetEntityType = "OrganizationUser",
                Action = "OwnershipTransferred",
                Description = $"Transferred organization ownership to user {request.TargetUserId}.",
                NewValuesJson = System.Text.Json.JsonSerializer.Serialize(new
                {
                    OwnerUserId = request.TargetUserId
                })
            }, cancellationToken);
        }, cancellationToken);

        await realtimeNotifier.NotifyUserAsync(
            request.TargetUserId,
            "MembershipChanged",
            new { OrganizationId = request.OrganizationId, Action = "owner" },
            cancellationToken);

        await realtimeNotifier.NotifyUserAsync(
            user.UserId,
            "MembershipChanged",
            new { OrganizationId = request.OrganizationId, Action = "ownership-transferred" },
            cancellationToken);

        return await sessionService.IssueAsync(
            user,
            request.OrganizationId,
            cancellationToken);
    }
}
