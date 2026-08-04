using FlowForge.Application.Services.Presence;
using Microsoft.AspNetCore.Mvc;

namespace FlowForge.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class PresenceController : ControllerBase
{
    private readonly IOnlineUserTracker _tracker;

    public PresenceController(IOnlineUserTracker tracker)
    {
        _tracker = tracker;
    }

    [HttpGet("online-users")]
    public IActionResult GetOnlineUsers()
    {
        return Ok(_tracker.GetOnlineUsers());
    }

    [HttpGet("is-online/{userId:guid}")]
    public IActionResult IsOnline(Guid userId)
    {
        return Ok(_tracker.IsOnline(userId));
    }
}