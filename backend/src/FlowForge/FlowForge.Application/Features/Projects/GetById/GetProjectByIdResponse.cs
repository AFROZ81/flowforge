namespace FlowForge.Application.Features.Projects.GetById;

public sealed class GetProjectByIdResponse
{
    public Guid Id { get; init; }

    public string Name { get; init; } = string.Empty;

    public string Key { get; init; } = string.Empty;

    public string? Description { get; init; }

    public string? Color { get; init; }

    public string? Icon { get; init; }

    public bool IsArchived { get; init; }
}