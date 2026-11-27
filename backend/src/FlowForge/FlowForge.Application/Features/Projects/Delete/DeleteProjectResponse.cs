namespace FlowForge.Application.Features.Projects.Delete;

public sealed class DeleteProjectResponse
{
    public Guid Id { get; init; }

    public DateTime DeletedAt { get; init; }
}
