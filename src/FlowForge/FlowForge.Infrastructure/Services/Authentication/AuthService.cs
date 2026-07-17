using FlowForge.Application.Features.Authentication.Register;
using FlowForge.Application.Interfaces;
using FlowForge.Application.Services.Authentication;
using FlowForge.Infrastructure.Identity;
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

    public AuthService(UserManager<ApplicationUser> userManager, IApplicationDbContext context)
    {
        _userManager = userManager;
        _context = context;
    }

    public async Task<RegisterResponse> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken = default)
    {
        // Check whether the organization exists.
        bool organizationExists = await _context.Organizations.AnyAsync(x => x.Id == request.OrganizationId, cancellationToken);

        if (!organizationExists)
            throw new InvalidOperationException("Organization not found.");

        // Check whether the email already exists.
        var existingUser = await _userManager.FindByEmailAsync(request.Email);

        if (existingUser is not null)
            throw new InvalidOperationException("Email already registered.");

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
            throw new InvalidOperationException(string.Join(Environment.NewLine, result.Errors.Select(x => x.Description)));
        }

        return new RegisterResponse
        {
            UserId = user.Id,
            Message = "User registered successfully."
        };
    }
}