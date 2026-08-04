using FlowForge.Application.Services.Presence;
using FlowForge.Application.Services.Realtime;

using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

using Serilog;

namespace FlowForge.API.Hubs;

[Authorize]
public sealed class NotificationHub : Hub
{
    private readonly IOnlineUserTracker _onlineUserTracker;
    private readonly IRealtimeNotifier _realtimeNotifier;

    public NotificationHub(IOnlineUserTracker onlineUserTracker, IRealtimeNotifier realtimeNotifier)
    {
        _onlineUserTracker = onlineUserTracker;
        _realtimeNotifier = realtimeNotifier;
    }
    
    public override async Task OnConnectedAsync()
    {
        var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var organizationId = Context.User?.FindFirst("organizationId")?.Value;

        if (!string.IsNullOrWhiteSpace(userId))
        {
            await Groups.AddToGroupAsync(
                Context.ConnectionId,
                $"user:{userId}");

            await _onlineUserTracker.UserConnectedAsync(Guid.Parse(userId));

            await _realtimeNotifier.NotifyUserOnlineAsync(Guid.Parse(userId));
        }

        if (!string.IsNullOrWhiteSpace(organizationId))
        {
            await Groups.AddToGroupAsync(
                Context.ConnectionId,
                $"organization:{organizationId}");
        }

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

            await _onlineUserTracker.UserDisconnectedAsync(Guid.Parse(userId));

            await _realtimeNotifier.NotifyUserOfflineAsync(Guid.Parse(userId));
        }

        if (!string.IsNullOrWhiteSpace(organizationId))
        {
            await Groups.RemoveFromGroupAsync(
                Context.ConnectionId,
                $"organization:{organizationId}");
        }

        await base.OnDisconnectedAsync(exception);
    }

    public async Task JoinBoard(Guid boardId)
    {
        await Groups.AddToGroupAsync(
            Context.ConnectionId,
            $"board:{boardId}");
    }

    public async Task LeaveBoard(Guid boardId)
    {
        await Groups.RemoveFromGroupAsync(
            Context.ConnectionId,
            $"board:{boardId}");
    }
}