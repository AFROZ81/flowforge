namespace FlowForge.Application.Features.Organizations.CreateOrganization;

/// <summary>
/// Represents the response returned after successfully creating an organization.
/// </summary>
public sealed class CreateOrganizationResponse
{
    /// <summary>
    /// Organization identifier.
    /// </summary>
    public Guid Id { get; init; }

    /// <summary>
    /// Organization name.
    /// </summary>
    public string Name { get; init; } = string.Empty;

    /// <summary>
    /// URL-friendly slug.
    /// </summary>
    public string Slug { get; init; } = string.Empty;
}