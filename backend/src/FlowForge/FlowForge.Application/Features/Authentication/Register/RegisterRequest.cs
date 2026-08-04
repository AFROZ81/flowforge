namespace FlowForge.Application.Features.Authentication.Register;

/// <summary>
/// Represents a request to register a new user.
/// </summary>
public sealed class RegisterRequest
{
    public required string FullName { get; init; }

    public required string Email { get; init; }

    public required string Password { get; init; }

    public required string ConfirmPassword { get; init; }

    public Guid OrganizationId { get; init; }
}
