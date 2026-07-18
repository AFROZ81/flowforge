namespace FlowForge.Application.Features.Authentication.CurrentUser;

public sealed class AuthenticatedUser
{
    public Guid UserId { get; init; }

    public string Email { get; init; } = string.Empty;

    public string FullName { get; init; } = string.Empty;

    public Guid OrganizationId { get; init; }
}