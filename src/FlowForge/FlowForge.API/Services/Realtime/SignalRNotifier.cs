using FlowForge.API.Hubs;
using FlowForge.Application.Services.Realtime;
using Microsoft.AspNetCore.SignalR;

using Serilog;

namespace FlowForge.API.Services.Realtime;

public sealed class SignalRNotifier : IRealtimeNotifier
{
    private readonly IHubContext<NotificationHub> _hubContext;

    public SignalRNotifier(IHubContext<NotificationHub> hubContext)
    {
        _hubContext = hubContext;
    }

    public async Task NotifyUserAsync(Guid userId, string eventName, object payload, CancellationToken cancellationToken = default)
    {
        await _hubContext.Clients
            .Group($"user:{userId}")
            .SendAsync(eventName, payload, cancellationToken);
    }

    public Task NotifyOrganizationAsync(Guid organizationId, string eventName, object payload, CancellationToken cancellationToken = default)
    {
        return _hubContext.Clients
            .Group($"organization:{organizationId}")
            .SendAsync(eventName, payload, cancellationToken);
    }

    public async Task NotifyUserOnlineAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        await _hubContext.Clients.All.SendAsync(
            "UserOnline",
            new
            {
                UserId = userId
            },
            cancellationToken);
    }

    public async Task NotifyUserOfflineAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        await _hubContext.Clients.All.SendAsync(
            "UserOffline",
            new
            {
                UserId = userId
            },
            cancellationToken);
    }

    public async Task NotifyBoardAsync(Guid boardId, string eventName, object payload, CancellationToken cancellationToken = default)
    {
        await _hubContext.Clients
            .Group($"board:{boardId}")
            .SendAsync(eventName, payload, cancellationToken);
    }
}