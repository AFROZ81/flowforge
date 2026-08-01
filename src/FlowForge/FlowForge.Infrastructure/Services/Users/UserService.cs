using FlowForge.Application.Services.Users;
using FlowForge.Infrastructure.Identity;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace FlowForge.Infrastructure.Services.Users;

public sealed class UserService : IUserService
{
    private readonly UserManager<ApplicationUser> _userManager;

    public UserService(UserManager<ApplicationUser> userManager)
    {
        _userManager = userManager;
    }

    public async Task<UserInfo?> GetByIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString());

        if (user is null)
            return null;

        return new UserInfo
        {
            Id = user.Id,
            OrganizationId = user.OrganizationId,
            FullName = user.FullName,
            Email = user.Email ?? string.Empty
        };
    }

    public async Task<List<UserInfo>> GetByOrganizationAsync(Guid organizationId, CancellationToken cancellationToken = default)
    {
        return await _userManager.Users
            .Where(x => x.OrganizationId == organizationId)
            .Select(x => new UserInfo
            {
                Id = x.Id,
                OrganizationId = x.OrganizationId,
                FullName = x.FullName,
                Email = x.Email ?? string.Empty
            })
            .ToListAsync(cancellationToken);
    }
}