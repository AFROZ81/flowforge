using FlowForge.Application.Features.Authentication.Register;
using FlowForge.Application.Services.Authentication;
using Microsoft.AspNetCore.Mvc;
using FlowForge.Application.Common.Responses;
using FlowForge.Application.Features.Authentication.Login;

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

    [HttpPost("register")]
    public async Task<ActionResult<ApiResponse<RegisterResponse>>> Register(RegisterRequest request)
    {
        RegisterResponse response = await _authService.RegisterAsync(request);

        return Ok(ApiResponse<RegisterResponse>.SuccessResponse(response, "User registered successfully."));
    }

    [HttpPost("login")]
    public async Task<ActionResult<ApiResponse<LoginResponse>>> Login(LoginRequest request)
    {
        var response = await _authService.LoginAsync(request);

        return Ok(ApiResponse<LoginResponse>.SuccessResponse(response, "Login successful."));
    }
}