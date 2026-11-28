namespace FlowForge.Application.Features.Organizations.SwitchOrganization;

/// <summary>
/// Response after switching organizations.
/// </summary>
public sealed class SwitchOrganizationResponse
{
    /// <summary>
    /// The new access token with the switched organization.
    /// </summary>
    public string AccessToken { get; init; } = string.Empty;

    /// <summary>
    /// UTC timestamp when the new token expires.
    /// </summary>
    public DateTime ExpiresAtUtc { get; init; }

    public Guid? OrganizationId { get; init; }
}