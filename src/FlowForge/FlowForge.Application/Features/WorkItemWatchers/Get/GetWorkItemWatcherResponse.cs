namespace FlowForge.Application.Features.WorkItemWatchers.Get;

public sealed class GetWorkItemWatcherResponse
{
    public Guid Id { get; init; }

    public Guid UserId { get; init; }

    public string FullName { get; init; } = string.Empty;

    public string Email { get; init; } = string.Empty;

    public DateTime CreatedAt { get; init; }
}