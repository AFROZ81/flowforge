using FlowForge.Application.Services.Presence;
using FlowForge.Application.Services.Realtime;
using FlowForge.Application.Common.Constants;

using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

using Serilog;

namespace FlowForge.API.Hubs;

[Authorize]
public sealed class NotificationHub : Hub
{
    private readonly IOnlineUserTracker _onlineUserTracker;
    private readonly IBoardPresenceTracker _boardPresenceTracker;
    private readonly IRealtimeNotifier _realtimeNotifier;

    public NotificationHub(IOnlineUserTracker onlineUserTracker, IBoardPresenceTracker boardPresenceTracker, IRealtimeNotifier realtimeNotifier)
    {
        _onlineUserTracker = onlineUserTracker;
        _boardPresenceTracker = boardPresenceTracker;
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
        await Groups.AddToGroupAsync(Context.ConnectionId, $"board:{boardId}");

        var userId = Guid.Parse(Context.User!.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        var userName = Context.User!.FindFirst(ClaimTypes.Name)?.Value ?? "Unknown";

        await _boardPresenceTracker.UserJoinedBoardAsync(boardId, userId, userName);

        var users = await _boardPresenceTracker.GetUsersAsync(boardId);

        await _realtimeNotifier.NotifyBoardPresenceChangedAsync(boardId, users);
    }

    public async Task LeaveBoard(Guid boardId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"board:{boardId}");

        var userId = Guid.Parse(Context.User!.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        await _boardPresenceTracker.UserLeftBoardAsync(boardId, userId);

        var users = await _boardPresenceTracker.GetUsersAsync(boardId);

        await _realtimeNotifier.NotifyBoardPresenceChangedAsync(boardId, users);
    }

    public async Task StartTyping(Guid boardId, Guid workItemId)
    {
        var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var userName = Context.User?.FindFirst(ClaimTypes.Name)?.Value;

        await Clients
            .GroupExcept($"board:{boardId}", Context.ConnectionId)
            .SendAsync(
                RealtimeEvents.TypingStarted,
                new
                {
                    BoardId = boardId,
                    WorkItemId = workItemId,
                    UserId = userId,
                    UserName = userName
                });
    }

    public async Task StopTyping(Guid boardId, Guid workItemId)
    {
        var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var userName = Context.User?.FindFirst(ClaimTypes.Name)?.Value;

        await Clients
            .GroupExcept($"board:{boardId}", Context.ConnectionId)
            .SendAsync(
                RealtimeEvents.TypingStopped,
                new
                {
                    BoardId = boardId,
                    WorkItemId = workItemId,
                    UserId = userId,
                    UserName = userName
                });
    }
}