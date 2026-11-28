using FlowForge.Application.Features.Authentication.CurrentUser;
using FlowForge.Application.Features.Organizations;
using FlowForge.Application.Interfaces;
using FlowForge.Application.Services.Authentication;
using FlowForge.Application.Services.Organizations;
using FlowForge.Domain.Entities;
using FlowForge.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace FlowForge.Infrastructure.Services.Organizations;

public sealed class OrganizationSessionService(
    IApplicationDbContext context,
    ITokenService tokenService) : IOrganizationSessionService
{
    public async Task<OrganizationSessionResponse> IssueAsync(
        AuthenticatedUser user,
        Guid? preferredOrganizationId,
        CancellationToken cancellationToken = default)
    {
        var memberships = await context.OrganizationUsers
            .AsNoTracking()
            .Where(x => x.UserId == user.UserId && !x.IsDeleted)
            .Select(x => new
            {
                Membership = x,
                Organization = x.Organization
            })
            .Where(x => !x.Organization.IsDeleted && x.Organization.IsActive)
            .OrderBy(x => x.Membership.CreatedAt)
            .ThenBy(x => x.Organization.Name)
            .ToListAsync(cancellationToken);

        var selected = preferredOrganizationId.HasValue
            ? memberships.FirstOrDefault(
                x => x.Membership.OrganizationId == preferredOrganizationId.Value)
            : null;

        selected ??= memberships.FirstOrDefault();

        if (selected is null)
        {
            var accountToken = tokenService.GenerateAccessToken(new AuthenticatedUser
            {
                UserId = user.UserId,
                Email = user.Email,
                FullName = user.FullName,
                OrganizationId = Guid.Empty,
                OrganizationIds = [],
                Role = UserRole.Member
            });

            return new OrganizationSessionResponse(
                accountToken.AccessToken,
                accountToken.ExpiresAtUtc,
                null);
        }

        var organizationIds = memberships
            .Select(x => x.Membership.OrganizationId)
            .Distinct()
            .ToList();

        var token = tokenService.GenerateAccessToken(new AuthenticatedUser
        {
            UserId = user.UserId,
            Email = user.Email,
            FullName = user.FullName,
            OrganizationId = selected.Membership.OrganizationId,
            MembershipId = selected.Membership.Id,
            TokenVersion = selected.Membership.TokenVersion,
            OrganizationIds = organizationIds,
            Role = selected.Membership.Role
        });

        return new OrganizationSessionResponse(
            token.AccessToken,
            token.ExpiresAtUtc,
            selected.Membership.OrganizationId);
    }
}
