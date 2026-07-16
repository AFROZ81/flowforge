using FlowForge.Application.Features.Organizations.CreateOrganization;

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
}