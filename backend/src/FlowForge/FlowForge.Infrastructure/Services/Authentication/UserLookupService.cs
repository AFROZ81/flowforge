using FlowForge.Application.Interfaces;
using FlowForge.Infrastructure.Identity;
using Microsoft.AspNetCore.Identity;

namespace FlowForge.Infrastructure.Services.Authentication;

/// <summary>
/// Implementation of user lookup using ASP.NET Core Identity.
/// </summary>
public sealed class UserLookupService : IUserLookupService
{
    private readonly UserManager<ApplicationUser> _userManager;

    public UserLookupService(UserManager<ApplicationUser> userManager)
    {
        _userManager = userManager;
    }

    public async Task<UserLookupResult?> FindByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        var user = await _userManager.FindByEmailAsync(email);
        if (user is null)
            return null;

        return new UserLookupResult
        {
            Id = user.Id,
            Email = user.Email!,
            FullName = user.FullName
        };
    }

    public async Task<UserLookupResult?> FindByIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user is null)
            return null;

        return new UserLookupResult
        {
            Id = user.Id,
            Email = user.Email!,
            FullName = user.FullName
        };
    }
}