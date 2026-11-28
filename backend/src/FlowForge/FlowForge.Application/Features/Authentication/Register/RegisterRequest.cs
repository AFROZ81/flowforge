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

    /// <summary>
    /// Invitation token for account creation that immediately accepts an invitation.
    /// </summary>
    public string? InvitationToken { get; init; }
}
