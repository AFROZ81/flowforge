namespace FlowForge.Application.Features.Organizations;

public sealed record UpdateOrganizationRequest(
    string Name,
    string? Description,
    string? LogoUrl);

public sealed record TransferOwnershipRequest(Guid TargetUserId);

public sealed record DeleteOrganizationRequest(string ConfirmationSlug);
