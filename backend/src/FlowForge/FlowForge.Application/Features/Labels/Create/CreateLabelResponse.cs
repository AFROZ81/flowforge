namespace FlowForge.Application.Features.Labels.Create;

public sealed class CreateLabelResponse
{
    public Guid Id { get; init; }

    public Guid OrganizationId { get; init; }

    public string Name { get; init; } = string.Empty;

    public string Color { get; init; } = string.Empty;

    public string? Description { get; init; }

    public DateTime CreatedAt { get; init; }
}