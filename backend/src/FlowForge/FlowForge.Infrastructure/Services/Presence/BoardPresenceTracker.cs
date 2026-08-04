using System.Collections.Concurrent;
using FlowForge.Application.Services.Presence;

namespace FlowForge.Infrastructure.Services.Presence;

public sealed class BoardPresenceTracker : IBoardPresenceTracker
{
    private readonly ConcurrentDictionary<Guid, ConcurrentDictionary<Guid, string>> _boards = new();

    public Task UserJoinedBoardAsync(Guid boardId, Guid userId, string userName)
    {
        var board = _boards.GetOrAdd(
            boardId,
            _ => new ConcurrentDictionary<Guid, string>());

        board[userId] = userName;

        return Task.CompletedTask;
    }

    public Task UserLeftBoardAsync(Guid boardId, Guid userId)
    {
        if (_boards.TryGetValue(boardId, out var board))
        {
            board.TryRemove(userId, out _);

            if (board.IsEmpty)
            {
                _boards.TryRemove(boardId, out _);
            }
        }

        return Task.CompletedTask;
    }

    public Task<IReadOnlyCollection<BoardViewer>> GetUsersAsync(Guid boardId)
    {
        if (!_boards.TryGetValue(boardId, out var board))
            return Task.FromResult<IReadOnlyCollection<BoardViewer>>([]);

        IReadOnlyCollection<BoardViewer> users =
            board.Select(x => new BoardViewer(
                x.Key,
                x.Value))
            .ToList();

        return Task.FromResult(users);
    }
}