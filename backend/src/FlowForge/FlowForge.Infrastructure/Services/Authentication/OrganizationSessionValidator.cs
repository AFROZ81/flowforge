using FlowForge.Application.Interfaces;
using FlowForge.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace FlowForge.Infrastructure.Services.Authentication;

public sealed record OrganizationSessionValidation(
    UserRole Role,
    bool IsOwner,
    int TokenVersion);

/// <summary>
/// Validates the organization part of a JWT against authoritative database state.
/// Account-only tokens do not call this validator.
/// </summary>
public sealed class OrganizationSessionValidator(IApplicationDbContext context)
{
    public async Task<OrganizationSessionValidation?> ValidateAsync(
        Guid userId,
        Guid organizationId,
        Guid? membershipId,
        int tokenVersion,
        CancellationToken cancellationToken = default)
    {
        if (!membershipId.HasValue)
            return null;

        var membership = await context.OrganizationUsers
            .AsNoTracking()
            .FirstOrDefaultAsync(
                x => x.Id == membershipId.Value &&
                     x.UserId == userId &&
                     x.OrganizationId == organizationId,
                cancellationToken);

        if (membership is null ||
            membership.IsDeleted ||
            membership.TokenVersion != tokenVersion)
        {
            return null;
        }

        var organizationIsActive = await context.Organizations
            .AsNoTracking()
            .AnyAsync(
                x => x.Id == organizationId && !x.IsDeleted && x.IsActive,
                cancellationToken);

        return organizationIsActive
            ? new OrganizationSessionValidation(
                membership.Role,
                membership.IsOwner,
                membership.TokenVersion)
            : null;
    }
}
