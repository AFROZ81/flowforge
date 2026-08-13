using System.Security.Claims;
using FlowForge.Application.Services.Presence;
using FlowForge.Application.Services.Users;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FlowForge.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public sealed class PresenceController : ControllerBase
{
    private readonly IOnlineUserTracker _tracker;
    private readonly IUserService _userService;

    public PresenceController(
        IOnlineUserTracker tracker,
        IUserService userService)
    {
        _tracker = tracker;
        _userService = userService;
    }

    // GET: /api/Presence/online-users
    [HttpGet("online-users")]
    public async Task<IActionResult> GetOnlineUsers(
        CancellationToken cancellationToken)
    {
        // Get the currently authenticated user.
        var currentUserIdValue =
            User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (!Guid.TryParse(
                currentUserIdValue,
                out var currentUserId))
        {
            return Unauthorized();
        }

        // Get the current user's organization.
        var currentUser =
            await _userService.GetByIdAsync(
                currentUserId,
                cancellationToken);

        if (currentUser is null)
        {
            return Unauthorized();
        }

        // Get all currently connected user IDs.
        var onlineUserIds =
            _tracker.GetOnlineUsers();

        if (onlineUserIds.Count == 0)
        {
            return Ok(Array.Empty<object>());
        }

        // Resolve IDs to actual users.
        var users =
            await _userService.GetDictionaryAsync(
                onlineUserIds,
                cancellationToken);

        // Only return users belonging to the
        // current user's organization.
        var result = users.Values
            .Where(x =>
                x.OrganizationId ==
                currentUser.OrganizationId)
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