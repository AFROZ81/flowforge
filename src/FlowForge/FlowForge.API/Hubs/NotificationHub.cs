using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

using Serilog;

namespace FlowForge.API.Hubs;

[Authorize]
public sealed class NotificationHub : Hub
{
    public override async Task OnConnectedAsync()
    {
        var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        var organizationId = Context.User?.FindFirst("organizationId")?.Value;

        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        var organizationId = Context.User?.FindFirst("organizationId")?.Value;

        if (!string.IsNullOrWhiteSpace(userId))
        {
            await Groups.RemoveFromGroupAsync(
                Context.ConnectionId,
                $"user:{userId}");
        }

        if (!string.IsNullOrWhiteSpace(organizationId))
        {
            await Groups.RemoveFromGroupAsync(
                Context.ConnectionId,
                $"organization:{organizationId}");
        }

        await base.OnDisconnectedAsync(exception);
    }
}