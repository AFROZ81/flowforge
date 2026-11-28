namespace FlowForge.Application.Features.Authentication.Register;

/// <summary>
/// Represents the response after successful user registration.
/// </summary>
public sealed class RegisterResponse
{
    public Guid UserId { get; init; }

    public string Message { get; init; } = string.Empty;

    /// <summary>
    /// Account-only session for normal registration, or organization session for
    /// invitation registration.
    /// </summary>
    public string? AccessToken { get; init; }

    public DateTime? ExpiresAtUtc { get; init; }
}