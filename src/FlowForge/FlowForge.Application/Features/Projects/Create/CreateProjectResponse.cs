namespace FlowForge.Application.Features.Projects.Create;

public sealed class CreateProjectResponse
{
    public Guid Id { get; init; }

    public string Name { get; init; } = string.Empty;

    public string Key { get; init; } = string.Empty;
}