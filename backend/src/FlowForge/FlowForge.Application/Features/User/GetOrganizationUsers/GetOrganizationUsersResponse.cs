namespace FlowForge.Application.Features.Users.GetOrganizationUsers;

public sealed class GetOrganizationUsersResponse
{
    public Guid Id { get; init; }

    public string FullName { get; init; } = string.Empty;

    public string? Email { get; init; }
}