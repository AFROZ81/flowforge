namespace FlowForge.Application.Features.Organizations.CreateOrganization;

/// <summary>
/// Represents the request to create a new organization.
/// </summary>
public sealed class CreateOrganizationRequest
{
    /// <summary>
    /// Organization name.
    /// </summary>
    public required string Name { get; init; }

    /// <summary>
    /// URL-friendly organization identifier.
    /// </summary>
    public required string Slug { get; init; }

    /// <summary>
    /// Optional organization description.
    /// </summary>
    public string? Description { get; init; }
}