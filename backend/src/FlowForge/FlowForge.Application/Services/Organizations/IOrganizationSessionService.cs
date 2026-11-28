using FlowForge.Application.Features.Authentication.CurrentUser;
using FlowForge.Application.Features.Organizations;

namespace FlowForge.Application.Services.Organizations;

public interface IOrganizationSessionService
{
    Task<OrganizationSessionResponse> IssueAsync(
        AuthenticatedUser user,
        Guid? preferredOrganizationId,
        CancellationToken cancellationToken = default);
}
