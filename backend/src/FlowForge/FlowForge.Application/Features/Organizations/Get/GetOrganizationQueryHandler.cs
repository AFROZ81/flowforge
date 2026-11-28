using FlowForge.Application.Features.Authentication.CurrentUser;
using FlowForge.Application.Features.Organizations;
using FlowForge.Application.Interfaces;
using FlowForge.Application.Services.Authentication;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FlowForge.Application.Features.Organizations.Get;

public sealed class GetOrganizationQueryHandler(
    IApplicationDbContext context,
    ICurrentUserService currentUser,
    OrganizationRules rules)
    : IRequestHandler<GetOrganizationQuery, OrganizationResponse>
{
    public async Task<OrganizationResponse> Handle(
        GetOrganizationQuery request,
        CancellationToken cancellationToken)
    {
        var user = currentUser.User;
        var organization = await rules.GetSessionOrganizationAsync(
            request.OrganizationId,
            user,
            cancellationToken);

        var membership = await context.OrganizationUsers
            .AsNoTracking()
            .FirstAsync(
                x => x.UserId == user.UserId &&
                     x.OrganizationId == organization.Id &&
                     !x.IsDeleted,
                cancellationToken);

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
