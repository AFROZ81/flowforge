using FlowForge.Application.Features.Authentication.Register;
using FlowForge.Application.Interfaces;
using FlowForge.Application.Services.Authentication;
using FlowForge.Infrastructure.Identity;
using FlowForge.Application.Common.Exceptions;
using FlowForge.Application.Features.Authentication.Login;
using FlowForge.Application.Features.Authentication.CurrentUser;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace FlowForge.Infrastructure.Services.Authentication;

/// <summary>
/// Handles authentication operations.
/// </summary>
public sealed class AuthService : IAuthService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IApplicationDbContext _context;
    private readonly ITokenService _tokenService;

    public AuthService(UserManager<ApplicationUser> userManager, IApplicationDbContext context, ITokenService tokenService)
    {
        _userManager = userManager;
        _context = context;
        _tokenService = tokenService;
    }

    public async Task<RegisterResponse> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken = default)
    {
        // Check whether the organization exists.
        bool organizationExists = await _context.Organizations.AnyAsync(x => x.Id == request.OrganizationId, cancellationToken);

        if (!organizationExists)
            throw new NotFoundException("Organization not found.");

        // Check whether the email already exists.
        var existingUser = await _userManager.FindByEmailAsync(request.Email);

        if (existingUser is not null)
            throw new ConflictException("Email already registered.");

        var user = new ApplicationUser
        {
            Id = Guid.NewGuid(),
            FullName = request.FullName,
            UserName = request.Email,
            Email = request.Email,
            OrganizationId = request.OrganizationId
        };

        IdentityResult result = await _userManager.CreateAsync(user, request.Password);

        if (!result.Succeeded)
        {
            throw new BadRequestException(string.Join(Environment.NewLine, result.Errors.Select(x => x.Description)));
        }

        return new RegisterResponse
        {
            UserId = user.Id,
            Message = "User registered successfully."
        };
    }

    public async Task<LoginResponse> LoginAsync(LoginRequest request)
    {
        var user = await _userManager.FindByEmailAsync(request.Email);

        if (user is null)
            throw new UnauthorizedException("Invalid email or password.");

        var passwordValid = await _userManager.CheckPasswordAsync(
            user,
            request.Password);

        if (!passwordValid)
            throw new UnauthorizedException("Invalid email or password.");

        var authenticatedUser = new AuthenticatedUser
        {
            UserId = user.Id,
            Email = user.Email!,
            FullName = user.FullName,
            OrganizationId = user.OrganizationId
        };

        var token = _tokenService.GenerateAccessToken(authenticatedUser);

        return new LoginResponse
        {
            AccessToken = token.AccessToken,
            ExpiresAtUtc = token.ExpiresAtUtc
        };
    }
}