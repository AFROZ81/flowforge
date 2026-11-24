using MediatR;

namespace FlowForge.Application.Features.Organizations.SwitchOrganization;

/// <summary>
/// Command to switch the current organization.
/// </summary>
public sealed class SwitchOrganizationCommand : IRequest<SwitchOrganizationResponse>
{
    public Guid OrganizationId { get; init; }
}