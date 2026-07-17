using FlowForge.Application.Features.Authentication.Register;
using FlowForge.Application.Services.Authentication;
using Microsoft.AspNetCore.Mvc;

namespace FlowForge.API.Controllers;

/// <summary>
/// Handles authentication endpoints.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public sealed class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    /// <summary>
    /// Registers a new user.
    /// </summary>
    [HttpPost("register")]
    public async Task<ActionResult<RegisterResponse>> Register(RegisterRequest request)
    {
        RegisterResponse response = await _authService.RegisterAsync(request);

        return Ok(response);
    }
}