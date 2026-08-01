namespace FlowForge.Application.Features.WorkItemWatchers.Create;

public sealed class CreateWorkItemWatcherResponse
{
    public Guid Id { get; init; }

    public Guid WorkItemId { get; init; }

    public Guid UserId { get; init; }

    public DateTime CreatedAt { get; init; }
}