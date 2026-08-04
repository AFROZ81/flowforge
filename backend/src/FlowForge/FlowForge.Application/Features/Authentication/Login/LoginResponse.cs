namespace FlowForge.Application.Features.Authentication.Login;

public sealed class LoginResponse
{
    public string AccessToken { get; init; } = string.Empty;

    public DateTime ExpiresAtUtc { get; init; }
}