using System.Collections.Concurrent;
using FlowForge.Application.Services.Presence;

namespace FlowForge.Infrastructure.Services.Presence;

public sealed class OnlineUserTracker : IOnlineUserTracker
{
    private readonly ConcurrentDictionary<Guid, byte> _onlineUsers = new();

    public Task UserConnectedAsync(Guid userId)
    {
        _onlineUsers.TryAdd(userId, 0);
        return Task.CompletedTask;
    }

    public Task UserDisconnectedAsync(Guid userId)
    {
        _onlineUsers.TryRemove(userId, out _);
        return Task.CompletedTask;
    }

    public bool IsOnline(Guid userId)
        => _onlineUsers.ContainsKey(userId);

    public IReadOnlyCollection<Guid> GetOnlineUsers()
        => _onlineUsers.Keys.ToList();
}