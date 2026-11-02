namespace FlowForge.Application.Features.Organizations.GetOrganizations;

/// <summary>
/// A workspace a new account can be created in.
/// </summary>
/// <remarks>
/// Deliberately the smallest possible surface — identifier and public label.
/// It is returned to callers that are not signed in yet, so nothing private
/// belongs here.
/// </remarks>
public sealed class OrganizationOption
{
    /// <summary>
    /// Organization identifier, as expected by <c>RegisterRequest.OrganizationId</c>.
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
