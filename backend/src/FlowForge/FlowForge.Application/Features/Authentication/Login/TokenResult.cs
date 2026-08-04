namespace FlowForge.Application.Features.Authentication.Login;

public sealed class TokenResult
{
    public string AccessToken { get; init; } = string.Empty;

    public DateTime ExpiresAtUtc { get; init; }
}