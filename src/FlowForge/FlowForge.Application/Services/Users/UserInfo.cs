namespace FlowForge.Application.Services.Users;

public sealed class UserInfo
{
    public Guid Id { get; init; }

    public Guid OrganizationId { get; init; }

    public string FullName { get; init; } = string.Empty;

    public string Email { get; init; } = string.Empty;
}