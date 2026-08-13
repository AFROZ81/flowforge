using System.Collections.Concurrent;
using FlowForge.Application.Services.Presence;

namespace FlowForge.Infrastructure.Services.Presence;

public sealed class OnlineUserTracker : IOnlineUserTracker
{
    private readonly ConcurrentDictionary<Guid, int> _connections = new();

    public Task UserConnectedAsync(Guid userId)
    {
        _connections.AddOrUpdate(
            userId,
            1,
            (_, count) => count + 1);

        return Task.CompletedTask;
    }

    public Task UserDisconnectedAsync(Guid userId)
    {
        while (true)
        {
            if (!_connections.TryGetValue(userId, out var count))
            {
                return Task.CompletedTask;
            }

            if (count <= 1)
            {
                _connections.TryRemove(userId, out _);
                return Task.CompletedTask;
            }

            if (_connections.TryUpdate(
                    userId,
                    count - 1,
                    count))
            {
                return Task.CompletedTask;
            }
        }
    }

    public bool IsOnline(Guid userId)
    {
        return _connections.ContainsKey(userId);
    }

    public IReadOnlyCollection<Guid> GetOnlineUsers()
    {
        return _connections.Keys.ToList();
    }
}