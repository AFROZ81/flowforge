using System.ComponentModel.DataAnnotations;

namespace FlowForge.Application.Features.Authentication.Login;

public sealed class LoginRequest
{
    [Required]
    public string Email { get; init; } = string.Empty;

    [Required]
    public string Password { get; init; } = string.Empty;
}