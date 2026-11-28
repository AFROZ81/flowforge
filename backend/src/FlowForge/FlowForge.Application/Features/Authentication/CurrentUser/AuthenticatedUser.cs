using FlowForge.Domain.Enums;

namespace FlowForge.Application.Features.Authentication.CurrentUser;

public sealed class AuthenticatedUser
{
    public Guid UserId { get; init; }

    public string Email { get; init; } = string.Empty;

    public string FullName { get; init; } = string.Empty;

    public Guid OrganizationId { get; init; }

    public Guid? MembershipId { get; init; }

    public int TokenVersion { get; init; }

    public bool HasOrganization => OrganizationId != Guid.Empty;

    public IReadOnlyList<Guid> OrganizationIds { get; init; } = new List<Guid>();

    public UserRole Role { get; init; } = UserRole.Member;
}