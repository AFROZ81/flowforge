namespace FlowForge.Application.Services.Presence;

public interface IBoardPresenceTracker
{
    Task UserJoinedBoardAsync(
        Guid boardId,
        Guid userId,
        string userName,
        string connectionId);

    Task UserLeftBoardAsync(
        Guid boardId,
        Guid userId,
        string connectionId);

    Task UserDisconnectedAsync(
        string connectionId);

    Task<IReadOnlyCollection<BoardViewer>> GetUsersAsync(
        Guid boardId);
}