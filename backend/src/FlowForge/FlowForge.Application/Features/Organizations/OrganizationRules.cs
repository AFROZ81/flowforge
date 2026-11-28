using FlowForge.Application.Common.Exceptions;
using FlowForge.Application.Features.Authentication.CurrentUser;
using FlowForge.Application.Interfaces;
using FlowForge.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace FlowForge.Application.Features.Organizations;

public sealed class OrganizationRules(IApplicationDbContext context)
{
    public async Task<Organization> GetSessionOrganizationAsync(
        Guid organizationId,
        AuthenticatedUser user,
        CancellationToken cancellationToken = default)
    {
        if (organizationId != user.OrganizationId)
            throw new NotFoundException("Organization not found.");

        var membership = await context.OrganizationUsers
            .AsNoTracking()
            .FirstOrDefaultAsync(
                x => x.UserId == user.UserId &&
                     x.OrganizationId == organizationId &&
                     !x.IsDeleted,
                cancellationToken);

        if (membership is null)
            throw new ForbiddenException("You are not a member of this organization.");

        var organization = await context.Organizations
            .AsNoTracking()
            .FirstOrDefaultAsync(
                x => x.Id == organizationId && !x.IsDeleted && x.IsActive,
                cancellationToken);

        if (organization is null)
            throw new ForbiddenException("This organization is not active.");

        return organization;
    }

    public async Task<Organization> GetOwnedOrganizationAsync(
        Guid organizationId,
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        var organization = await context.Organizations
            .AsNoTracking()
            .FirstOrDefaultAsync(
                x => x.Id == organizationId && !x.IsDeleted,
                cancellationToken);

        if (organization is null)
            throw new NotFoundException("Organization not found.");

        var isOwner = await context.OrganizationUsers
            .AsNoTracking()
            .AnyAsync(
                x => x.UserId == userId &&
                     x.OrganizationId == organizationId &&
                     x.IsOwner &&
                     !x.IsDeleted,
                cancellationToken);

        if (!isOwner)
            throw new ForbiddenException("Only the organization owner can perform this action.");

        return organization;
    }

    public async Task<OrganizationUser> GetMembershipAsync(
        Guid userId,
        Guid organizationId,
        CancellationToken cancellationToken = default)
    {
        return await context.OrganizationUsers
            .FirstOrDefaultAsync(
                x => x.UserId == userId &&
                     x.OrganizationId == organizationId &&
                     !x.IsDeleted,
                cancellationToken)
            ?? throw new NotFoundException("Membership not found.");
    }
}
