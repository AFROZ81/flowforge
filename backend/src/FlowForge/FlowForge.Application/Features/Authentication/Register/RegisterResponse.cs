namespace FlowForge.Application.Features.Authentication.Register;

/// <summary>
/// Represents the response after successful user registration.
/// </summary>
public sealed class RegisterResponse
{
    public Guid UserId { get; init; }

    public string Message { get; init; } = string.Empty;
}