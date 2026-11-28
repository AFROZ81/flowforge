using FlowForge.Application.Common.Exceptions;
using FlowForge.Application.Features.Authentication.CurrentUser;
using FlowForge.Application.Features.Organizations;
using FlowForge.Application.Interfaces;
using FlowForge.Application.Services.AuditLogs;
using FlowForge.Application.Services.Authentication;
using FlowForge.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FlowForge.Application.Features.Organizations.Update;

public sealed class UpdateOrganizationCommandHandler(
    IApplicationDbContext context,
    ICurrentUserService currentUser,
    OrganizationRules rules,
    IAuditLogService auditLogService)
    : IRequestHandler<UpdateOrganizationCommand, OrganizationResponse>
{
    public async Task<OrganizationResponse> Handle(
        UpdateOrganizationCommand request,
        CancellationToken cancellationToken)
    {
        var user = currentUser.User;
        await rules.GetSessionOrganizationAsync(request.OrganizationId, user, cancellationToken);

        var membership = await context.OrganizationUsers
            .AsNoTracking()
            .FirstAsync(
                x => x.UserId == user.UserId &&
                     x.OrganizationId == request.OrganizationId &&
                     !x.IsDeleted,
                cancellationToken);

        if (membership.Role != UserRole.Admin)
            throw new ForbiddenException("Only organization admins can update the profile.");

        var organization = await context.Organizations
            .FirstAsync(x => x.Id == request.OrganizationId, cancellationToken);

        var oldName = organization.Name;
        organization.UpdateProfile(
            request.Name,
            request.Description,
            request.LogoUrl,
            user.UserId);

        await context.SaveChangesAsync(cancellationToken);

        await auditLogService.CreateAsync(new AuditLogEntry
        {
            Type = AuditLogType.OrganizationUpdated,
            OrganizationId = organization.Id,
            ActorId = user.UserId,
            ActorName = user.FullName,
            TargetEntityId = organization.Id,
            TargetEntityType = "Organization",
            Action = "OrganizationUpdated",
            Description = $"Updated organization profile from {oldName} to {organization.Name}.",
            OldValuesJson = System.Text.Json.JsonSerializer.Serialize(new { Name = oldName }),
            NewValuesJson = System.Text.Json.JsonSerializer.Serialize(new
            {
                organization.Name,
                organization.Description,
                organization.LogoUrl
            })
        }, cancellationToken);

        return new OrganizationResponse(
            organization.Id,
            organization.Name,
            organization.Slug,
            organization.Description,
            organization.LogoUrl,
            organization.IsActive,
            membership.Role,
            membership.IsOwner);
    }
}
