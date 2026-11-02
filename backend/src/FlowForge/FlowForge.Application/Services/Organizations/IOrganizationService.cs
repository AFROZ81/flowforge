using FlowForge.Application.Features.Organizations.CreateOrganization;
using FlowForge.Application.Features.Organizations.GetOrganizations;

namespace FlowForge.Application.Services.Organizations;

/// <summary>
/// Defines operations for managing organizations.
/// </summary>
public interface IOrganizationService
{
    /// <summary>
    /// Creates a new organization.
    /// </summary>
    Task<CreateOrganizationResponse> CreateAsync(CreateOrganizationRequest request, CancellationToken cancellationToken = default);

    /// <summary>
    /// Lists the active organizations a new account may be created in.
    /// Read-only and safe to expose before anyone is signed in.
    /// </summary>
    Task<List<OrganizationOption>> GetOptionsAsync(CancellationToken cancellationToken = default);
}