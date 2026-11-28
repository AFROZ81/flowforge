using FlowForge.Domain.Enums;

namespace FlowForge.Application.Features.Organizations;

public sealed record OrganizationResponse(
    Guid Id,
    string Name,
    string Slug,
    string? Description,
    string? LogoUrl,
    bool IsActive,
    UserRole Role,
    bool IsOwner);

public sealed record OrganizationMembershipResponse(
    Guid Id,
    string Name,
    string Slug,
    string? LogoUrl,
    UserRole Role,
    bool IsActive,
    bool IsOwner);

public sealed record OrganizationSessionResponse(
    string AccessToken,
    DateTime ExpiresAtUtc,
    Guid? OrganizationId);
