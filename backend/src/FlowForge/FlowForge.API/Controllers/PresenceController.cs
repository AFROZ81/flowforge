using FlowForge.Application.Interfaces;
using FlowForge.Application.Services.Authentication;
using FlowForge.Application.Services.Presence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FlowForge.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public sealed class PresenceController : ControllerBase
{
    private readonly IOnlineUserTracker _tracker;
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public PresenceController(
        IOnlineUserTracker tracker,
        IApplicationDbContext context,
        ICurrentUserService currentUser)
    {
        _tracker = tracker;
        _context = context;
        _currentUser = currentUser;
    }

    // GET: /api/Presence/online-users
    [HttpGet("online-users")]
    public async Task<IActionResult> GetOnlineUsers(
        CancellationToken cancellationToken)
    {
        // Get all currently connected user IDs.
        var onlineUserIds =
            _tracker.GetOnlineUsers();

        if (onlineUserIds.Count == 0)
        {
            return Ok(Array.Empty<object>());
        }

        /*
         * OrganizationUsers is the source of truth for membership.
         * Filtering AspNetUsers.OrganizationId here misses multi-organization
         * users, including Admins whose legacy organization id is unset.
         */
        var organizationUsers =
            await _context.GetOrganizationUsersAsync(
                _currentUser.User.OrganizationId,
                cancellationToken);

        var onlineUserIdSet = onlineUserIds.ToHashSet();

        var result = organizationUsers
            .Where(x => onlineUserIdSet.Contains(x.Id))
            .Select(x => new
            {
                userId = x.Id,
                fullName = string.IsNullOrWhiteSpace(x.FullName)
                    ? "Unknown User"
                    : x.FullName
            })
            .OrderBy(x => x.fullName)
            .ToList();

        return Ok(result);
    }

    // GET: /api/Presence/is-online/{userId}
    [HttpGet("is-online/{userId:guid}")]
    public IActionResult IsOnline(Guid userId)
    {
        return Ok(
            _tracker.IsOnline(userId));
    }
}