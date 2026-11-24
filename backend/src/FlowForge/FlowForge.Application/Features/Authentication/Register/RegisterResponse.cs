namespace FlowForge.Application.Features.Authentication.Register;

/// <summary>
/// Represents the response after successful user registration.
/// </summary>
public sealed class RegisterResponse
{
    public Guid UserId { get; init; }

    public string Message { get; init; } = string.Empty;

    /// <summary>
    /// Session token returned when registration also accepts an invitation.
    /// </summary>
    public string? AccessToken { get; init; }

    public DateTime? ExpiresAtUtc { get; init; }
}