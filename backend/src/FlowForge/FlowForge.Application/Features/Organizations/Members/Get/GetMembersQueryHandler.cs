using FlowForge.Application.Features.Organizations.Members.Get;
using FlowForge.Application.Interfaces;
using FlowForge.Application.Services.Authentication;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FlowForge.Application.Features.Organizations.Members.Get;

/// <summary>
/// Handles <see cref="GetMembersQuery"/>.
/// </summary>
public sealed class GetMembersQueryHandler : IRequestHandler<GetMembersQuery, List<GetMembersResponse>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly IUserLookupService _userLookup;

    public GetMembersQueryHandler(IApplicationDbContext context, ICurrentUserService currentUser, IUserLookupService userLookup)
    {
        _context = context;
        _currentUser = currentUser;
        _userLookup = userLookup;
    }

    public async Task<List<GetMembersResponse>> Handle(GetMembersQuery request, CancellationToken cancellationToken)
    {
        var currentUser = _currentUser.User;

        // Get all organization users with their roles
        var orgUsers = await _context.OrganizationUsers
            .AsNoTracking()
            .Where(ou => ou.OrganizationId == request.OrganizationId)
            .ToListAsync(cancellationToken);

        // Get unique user IDs
        var userIds = orgUsers.Select(ou => ou.UserId).Distinct().ToList();

        // Look up user details
        var userDetails = new Dictionary<Guid, (string Email, string FullName)>();
        foreach (var userId in userIds)
        {
            var user = await _userLookup.FindByIdAsync(userId, cancellationToken);
            if (user is not null)
            {
                userDetails[userId] = (user.Email, user.FullName);
            }
        }

        return orgUsers.Select(ou =>
        {
            userDetails.TryGetValue(ou.UserId, out var details);
            return new GetMembersResponse
            {
                UserId = ou.UserId,
                Email = details.Email,
                FullName = details.FullName,
                Role = ou.Role,
                JoinedAt = ou.CreatedAt,
                IsCurrentUser = ou.UserId == currentUser.UserId
            };
        }).OrderBy(m => m.FullName).ToList();
    }
}