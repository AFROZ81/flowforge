using FlowForge.Application.Features.Authentication.Register;
using FlowForge.Application.Services.Authentication;
using Microsoft.AspNetCore.Mvc;
using FlowForge.Application.Common.Responses;
using FlowForge.Application.Features.Authentication.Login;
using Microsoft.AspNetCore.RateLimiting;
using FlowForge.Application.Features.Authentication.CurrentUser;
using Microsoft.AspNetCore.Authorization;

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
    [EnableRateLimiting("LoginPolicy")]
    public async Task<ActionResult<ApiResponse<LoginResponse>>> Login(LoginRequest request)
    {
        var response = await _authService.LoginAsync(request);

        return Ok(ApiResponse<LoginResponse>.SuccessResponse(response, "Login successful."));
    }

    [HttpPost("refresh")]
    [Authorize]
    public async Task<ActionResult<ApiResponse<LoginResponse>>> RefreshToken()
    {
        var user = HttpContext.RequestServices.GetRequiredService<ICurrentUserService>().User;

        var response = await _authService.RefreshTokenAsync(user);

        return Ok(ApiResponse<LoginResponse>.SuccessResponse(response, "Token refreshed successfully."));
    }
}