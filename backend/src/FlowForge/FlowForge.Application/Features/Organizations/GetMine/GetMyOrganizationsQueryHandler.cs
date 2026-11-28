using FlowForge.Application.Features.Authentication.CurrentUser;
using FlowForge.Application.Features.Organizations;
using FlowForge.Application.Interfaces;
using FlowForge.Application.Services.Authentication;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FlowForge.Application.Features.Organizations.GetMine;

public sealed class GetMyOrganizationsQueryHandler(
    IApplicationDbContext context,
    ICurrentUserService currentUser)
    : IRequestHandler<GetMyOrganizationsQuery, List<OrganizationMembershipResponse>>
{
    public async Task<List<OrganizationMembershipResponse>> Handle(
        GetMyOrganizationsQuery request,
        CancellationToken cancellationToken)
    {
        var user = currentUser.TryGetUser()
            ?? throw new UnauthorizedAccessException("User is not authenticated.");
        var userId = user.UserId;

        return await BuildQuery(context, userId).ToListAsync(cancellationToken);
    }

    internal static IQueryable<OrganizationMembershipResponse> BuildQuery(
        IApplicationDbContext context,
        Guid userId)
    {
        return context.OrganizationUsers
            .AsNoTracking()
            .Where(x => x.UserId == userId && !x.IsDeleted && !x.Organization.IsDeleted)
            .OrderByDescending(x => x.Organization.IsActive)
            .ThenBy(x => x.Organization.Name)
            .Select(x => new OrganizationMembershipResponse(
                x.OrganizationId,
                x.Organization.Name,
                x.Organization.Slug,
                x.Organization.LogoUrl,
                x.Role,
                x.Organization.IsActive,
                x.IsOwner));
    }
}
