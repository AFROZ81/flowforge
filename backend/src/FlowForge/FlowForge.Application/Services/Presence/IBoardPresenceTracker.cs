namespace FlowForge.Application.Services.Presence;

public interface IBoardPresenceTracker
{
    Task UserJoinedBoardAsync(Guid boardId, Guid userId, string userName);

    Task UserLeftBoardAsync(Guid boardId, Guid userId);

    Task<IReadOnlyCollection<BoardViewer>> GetUsersAsync(Guid boardId);
}