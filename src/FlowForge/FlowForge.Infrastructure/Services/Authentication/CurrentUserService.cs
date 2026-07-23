using System.Security.Claims;
using FlowForge.Application.Features.Authentication.CurrentUser;
using FlowForge.Application.Services.Authentication;
using Microsoft.AspNetCore.Http;

namespace FlowForge.Infrastructure.Services.Authentication;

public sealed class CurrentUserService : ICurrentUserService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentUserService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public AuthenticatedUser User
    {
        get
        {
            var user = _httpContextAccessor.HttpContext?.User;

            if (user?.Identity?.IsAuthenticated != true)
                throw new UnauthorizedAccessException("User is not authenticated.");

            var userId = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            
            var organizationId = user.FindFirst("organizationId")?.Value;

            if (string.IsNullOrWhiteSpace(userId))
                throw new UnauthorizedAccessException("UserId claim is missing.");

            if (string.IsNullOrWhiteSpace(organizationId))
                throw new UnauthorizedAccessException("OrganizationId claim is missing.");

            return new AuthenticatedUser
            {
                UserId = Guid.Parse(userId),
                Email = user.FindFirst(ClaimTypes.Email)?.Value ?? string.Empty,
                FullName = user.FindFirst(ClaimTypes.Name)?.Value ?? string.Empty,
                OrganizationId = Guid.Parse(organizationId)
            };
        }
    }
}