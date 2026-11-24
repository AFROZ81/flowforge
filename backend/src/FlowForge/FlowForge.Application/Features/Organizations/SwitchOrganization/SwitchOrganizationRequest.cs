using System.ComponentModel.DataAnnotations;

namespace FlowForge.Application.Features.Organizations.SwitchOrganization;

/// <summary>
/// Request to switch the current organization.
/// </summary>
public sealed class SwitchOrganizationRequest
{
    /// <summary>
    /// The ID of the organization to switch to.
    /// </summary>
    [Required]
    public Guid OrganizationId { get; init; }
}