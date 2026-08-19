using System.Collections.Concurrent;
using FlowForge.Application.Services.Presence;

namespace FlowForge.Infrastructure.Services.Presence;

public sealed class BoardPresenceTracker : IBoardPresenceTracker
{
    /*
     * BoardId
     *     ↓
     * UserId
     *     ↓
     * UserName + ConnectionIds
     */
    private sealed class BoardUserPresence
    {
        public Guid UserId { get; }

        public string UserName { get; set; }

        public ConcurrentDictionary<string, byte> Connections { get; } = new();

        public BoardUserPresence(
            Guid userId,
            string userName)
        {
            UserId = userId;
            UserName = userName;
        }
    }


    /*
     * BoardId -> Users currently viewing that board
     */
    private readonly ConcurrentDictionary<
        Guid,
        ConcurrentDictionary<Guid, BoardUserPresence>
    > _boards = new();


    /*
     * ConnectionId -> boards that connection has joined
     *
     * This is critical for OnDisconnectedAsync().
     */
    private readonly ConcurrentDictionary<
        string,
        ConcurrentDictionary<Guid, byte>
    > _connectionBoards = new();


    /* =========================================================
       USER JOINED BOARD
       ========================================================= */

    public Task UserJoinedBoardAsync(
        Guid boardId,
        Guid userId,
        string userName,
        string connectionId)
    {
        var board =
            _boards.GetOrAdd(
                boardId,
                _ => new ConcurrentDictionary<Guid, BoardUserPresence>()
            );


        var user =
            board.GetOrAdd(
                userId,
                _ => new BoardUserPresence(
                    userId,
                    userName
                )
            );


        /*
         * Keep the latest display name.
         */
        user.UserName =
            string.IsNullOrWhiteSpace(userName)
                ? user.UserName
                : userName;


        /*
         * A user may have multiple tabs/connections
         * open on the same board.
         */
        user.Connections.TryAdd(
            connectionId,
            0
        );


        /*
         * Track which boards this connection belongs to.
         */
        var connectionBoards =
            _connectionBoards.GetOrAdd(
                connectionId,
                _ => new ConcurrentDictionary<Guid, byte>()
            );


        connectionBoards.TryAdd(
            boardId,
            0
        );


        return Task.CompletedTask;
    }


    /* =========================================================
       USER LEFT BOARD
       ========================================================= */

    public Task UserLeftBoardAsync(
        Guid boardId,
        Guid userId,
        string connectionId)
    {
        if (
            !_boards.TryGetValue(
                boardId,
                out var board)
        )
        {
            return Task.CompletedTask;
        }


        if (
            board.TryGetValue(
                userId,
                out var user)
        )
        {
            /*
             * Remove only THIS connection.
             *
             * If the user has another tab open,
             * they remain visible.
             */
            user.Connections.TryRemove(
                connectionId,
                out _
            );


            /*
             * User is completely gone from this board
             * only when they have no remaining connections.
             */
            if (
                user.Connections.IsEmpty
            )
            {
                board.TryRemove(
                    userId,
                    out _
                );
            }
        }


        /*
         * Remove board membership from this connection.
         */
        if (
            _connectionBoards.TryGetValue(
                connectionId,
                out var connectionBoards)
        )
        {
            connectionBoards.TryRemove(
                boardId,
                out _
            );


            if (
                connectionBoards.IsEmpty
            )
            {
                _connectionBoards.TryRemove(
                    connectionId,
                    out _
                );
            }
        }


        /*
         * Remove empty board.
         */
        if (
            board.IsEmpty
        )
        {
            _boards.TryRemove(
                boardId,
                out _
            );
        }


        return Task.CompletedTask;
    }


    /* =========================================================
       CONNECTION DISCONNECTED
       ========================================================= */

    public Task UserDisconnectedAsync(
        string connectionId)
    {
        /*
         * Find every board this connection was viewing.
         */
        if (
            !_connectionBoards.TryRemove(
                connectionId,
                out var boardIds)
        )
        {
            return Task.CompletedTask;
        }


        foreach (
            var boardId in boardIds.Keys)
        {
            if (
                !_boards.TryGetValue(
                    boardId,
                    out var board)
            )
            {
                continue;
            }


            foreach (
                var userPair in board)
            {
                var user =
                    userPair.Value;


                /*
                 * Remove this connection from the user.
                 */
                user.Connections.TryRemove(
                    connectionId,
                    out _
                );


                /*
                 * If this was their last connection
                 * to this board, remove the user.
                 */
                if (
                    user.Connections.IsEmpty
                )
                {
                    board.TryRemove(
                        user.UserId,
                        out _
                    );
                }
            }


            /*
             * Remove empty board.
             */
            if (
                board.IsEmpty
            )
            {
                _boards.TryRemove(
                    boardId,
                    out _
                );
            }
        }


        return Task.CompletedTask;
    }


    /* =========================================================
       GET BOARD USERS
       ========================================================= */

    public Task<IReadOnlyCollection<BoardViewer>> GetUsersAsync(
        Guid boardId)
    {
        if (
            !_boards.TryGetValue(
                boardId,
                out var board)
        )
        {
            return Task.FromResult<
                IReadOnlyCollection<BoardViewer>
            >([]);
        }


        IReadOnlyCollection<BoardViewer> users =
            board.Values
                .Where(
                    user =>
                        !user.Connections.IsEmpty
                )
                .Select(
                    user =>
                        new BoardViewer(
                            user.UserId,
                            user.UserName
                        )
                )
                .ToList();


        return Task.FromResult(
            users
        );
    }
}