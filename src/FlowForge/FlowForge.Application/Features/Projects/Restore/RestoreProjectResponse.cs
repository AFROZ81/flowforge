namespace FlowForge.Application.Features.Projects.Restore;

public sealed class RestoreProjectResponse
{
    public Guid Id { get; init; }

    public bool IsArchived { get; init; }
}