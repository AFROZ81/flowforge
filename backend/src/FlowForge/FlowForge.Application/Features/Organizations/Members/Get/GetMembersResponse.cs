using FlowForge.Domain.Enums;

namespace FlowForge.Application.Features.Organizations.Members.Get;

/// <summary>
/// Response for listing organization members.
/// </summary>
public sealed class GetMembersResponse
{
    public Guid UserId { get; init; }
    public string Email { get; init; } = string.Empty;
    public string FullName { get; init; } = string.Empty;
    public UserRole Role { get; init; }
    public DateTime JoinedAt { get; init; }
    public bool IsCurrentUser { get; init; }
}