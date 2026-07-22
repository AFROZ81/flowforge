namespace FlowForge.Application.Features.Projects.Update;

public sealed class UpdateProjectResponse
{
    public Guid Id { get; init; }

    public string Name { get; init; } = string.Empty;
}