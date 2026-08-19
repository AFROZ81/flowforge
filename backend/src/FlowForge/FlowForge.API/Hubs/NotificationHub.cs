using FlowForge.Application.Services.Presence;
using FlowForge.Application.Services.Realtime;
using FlowForge.Application.Common.Constants;

using System.Security.Claims;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace FlowForge.API.Hubs;

[Authorize]
public sealed class NotificationHub : Hub
{
    private readonly IOnlineUserTracker _onlineUserTracker;

    private readonly IBoardPresenceTracker _boardPresenceTracker;

    private readonly IRealtimeNotifier _realtimeNotifier;


    public NotificationHub(
        IOnlineUserTracker onlineUserTracker,
        IBoardPresenceTracker boardPresenceTracker,
        IRealtimeNotifier realtimeNotifier)
    {
        _onlineUserTracker =
            onlineUserTracker;

        _boardPresenceTracker =
            boardPresenceTracker;

        _realtimeNotifier =
            realtimeNotifier;
    }


    /* =========================================================
       CONNECTION
       ========================================================= */

    public override async Task OnConnectedAsync()
    {
        var userIdValue =
            Context.User?
                .FindFirst(
                    ClaimTypes.NameIdentifier)
                ?.Value;


        var organizationId =
            Context.User?
                .FindFirst(
                    "organizationId")
                ?.Value;


        if (
            Guid.TryParse(
                userIdValue,
                out var userId)
        )
        {
            /*
             * User-specific SignalR group.
             */
            await Groups.AddToGroupAsync(
                Context.ConnectionId,
                $"user:{userId}"
            );


            /*
             * Global online presence.
             */
            await _onlineUserTracker
                .UserConnectedAsync(
                    userId
                );


            /*
             * Notify the rest of the organization.
             */
            await _realtimeNotifier
                .NotifyUserOnlineAsync(
                    userId
                );
        }


        if (
            !string.IsNullOrWhiteSpace(
                organizationId)
        )
        {
            await Groups.AddToGroupAsync(
                Context.ConnectionId,
                $"organization:{organizationId}"
            );
        }


        await base.OnConnectedAsync();
    }


    /* =========================================================
       DISCONNECTION
       ========================================================= */

    public override async Task OnDisconnectedAsync(
        Exception? exception)
    {
        var userIdValue =
            Context.User?
                .FindFirst(
                    ClaimTypes.NameIdentifier)
                ?.Value;


        var organizationId =
            Context.User?
                .FindFirst(
                    "organizationId")
                ?.Value;


        /*
         * FIRST:
         *
         * Remove this SignalR connection from all boards.
         *
         * This is the part your old implementation was missing.
         */
        await _boardPresenceTracker
            .UserDisconnectedAsync(
                Context.ConnectionId
            );


        /*
         * Global user presence.
         */
        if (
            Guid.TryParse(
                userIdValue,
                out var userId)
        )
        {
            await Groups.RemoveFromGroupAsync(
                Context.ConnectionId,
                $"user:{userId}"
            );


            await _onlineUserTracker
                .UserDisconnectedAsync(
                    userId
                );


            await _realtimeNotifier
                .NotifyUserOfflineAsync(
                    userId
                );
        }


        if (
            !string.IsNullOrWhiteSpace(
                organizationId)
        )
        {
            await Groups.RemoveFromGroupAsync(
                Context.ConnectionId,
                $"organization:{organizationId}"
            );
        }


        await base.OnDisconnectedAsync(
            exception
        );
    }


    /* =========================================================
       JOIN BOARD
       ========================================================= */

    public async Task JoinBoard(
        Guid boardId)
    {
        var userIdValue =
            Context.User?
                .FindFirst(
                    ClaimTypes.NameIdentifier)
                ?.Value;


        if (
            !Guid.TryParse(
                userIdValue,
                out var userId)
        )
        {
            throw new HubException(
                "Unable to determine current user."
            );
        }


        var userName =
            Context.User?
                .FindFirst(
                    ClaimTypes.Name)
                ?.Value
            ?? "Unknown";


        /*
         * Join SignalR board group.
         */
        await Groups.AddToGroupAsync(
            Context.ConnectionId,
            $"board:{boardId}"
        );


        /*
         * Track this exact connection.
         */
        await _boardPresenceTracker
            .UserJoinedBoardAsync(
                boardId,
                userId,
                userName,
                Context.ConnectionId
            );


        /*
         * Get fresh board presence.
         */
        var users =
            await _boardPresenceTracker
                .GetUsersAsync(
                    boardId
                );


        /*
         * Notify board viewers.
         */
        await _realtimeNotifier
            .NotifyBoardPresenceChangedAsync(
                boardId,
                users
            );
    }


    /* =========================================================
       LEAVE BOARD
       ========================================================= */

    public async Task LeaveBoard(
        Guid boardId)
    {
        var userIdValue =
            Context.User?
                .FindFirst(
                    ClaimTypes.NameIdentifier)
                ?.Value;


        if (
            !Guid.TryParse(
                userIdValue,
                out var userId)
        )
        {
            return;
        }


        /*
         * Leave SignalR board group.
         */
        await Groups.RemoveFromGroupAsync(
            Context.ConnectionId,
            $"board:{boardId}"
        );


        /*
         * Remove only this connection
         * from board presence.
         */
        await _boardPresenceTracker
            .UserLeftBoardAsync(
                boardId,
                userId,
                Context.ConnectionId
            );


        /*
         * Get updated list.
         */
        var users =
            await _boardPresenceTracker
                .GetUsersAsync(
                    boardId
                );


        /*
         * Broadcast updated presence.
         */
        await _realtimeNotifier
            .NotifyBoardPresenceChangedAsync(
                boardId,
                users
            );
    }


    /* =========================================================
       TYPING STARTED
       ========================================================= */

    public async Task StartTyping(
        Guid boardId,
        Guid workItemId)
    {
        var userId =
            Context.User?
                .FindFirst(
                    ClaimTypes.NameIdentifier)
                ?.Value;


        var userName =
            Context.User?
                .FindFirst(
                    ClaimTypes.Name)
                ?.Value;


        await Clients
            .GroupExcept(
                $"board:{boardId}",
                Context.ConnectionId)
            .SendAsync(
                RealtimeEvents.TypingStarted,
                new
                {
                    BoardId =
                        boardId,

                    WorkItemId =
                        workItemId,

                    UserId =
                        userId,

                    UserName =
                        userName
                }
            );
    }


    /* =========================================================
       TYPING STOPPED
       ========================================================= */

    public async Task StopTyping(
        Guid boardId,
        Guid workItemId)
    {
        var userId =
            Context.User?
                .FindFirst(
                    ClaimTypes.NameIdentifier)
                ?.Value;


        var userName =
            Context.User?
                .FindFirst(
                    ClaimTypes.Name)
                ?.Value;


        await Clients
            .GroupExcept(
                $"board:{boardId}",
                Context.ConnectionId)
            .SendAsync(
                RealtimeEvents.TypingStopped,
                new
                {
                    BoardId =
                        boardId,

                    WorkItemId =
                        workItemId,

                    UserId =
                        userId,

                    UserName =
                        userName
                }
            );
    }
}