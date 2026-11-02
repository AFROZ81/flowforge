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

    public AuthenticatedUser User => Resolve(required: true)!;

    public AuthenticatedUser? TryGetUser() => Resolve(required: false);

    /// <summary>
    /// Reads the principal off the current request.
    /// </summary>
    /// <param name="required">
    /// When true, an anonymous request or an incomplete identity throws — the
    /// behaviour every authorised endpoint depends on. When false the same
    /// situations simply return null, which is what lets a write that happens
    /// before anyone is signed in (account signup, first-run workspace
    /// creation) go through at all.
    /// </param>
    private AuthenticatedUser? Resolve(bool required)
    {
        var user = _httpContextAccessor.HttpContext?.User;

        if (user?.Identity?.IsAuthenticated != true)
        {
            if (required)
                throw new UnauthorizedAccessException("User is not authenticated.");

            return null;
        }

        var userId = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        var organizationId = user.FindFirst("organizationId")?.Value;

        if (string.IsNullOrWhiteSpace(userId))
        {
            if (required)
                throw new UnauthorizedAccessException("UserId claim is missing.");

            return null;
        }

        if (string.IsNullOrWhiteSpace(organizationId))
        {
            if (required)
                throw new UnauthorizedAccessException("OrganizationId claim is missing.");

            return null;
        }

        return new AuthenticatedUser
        {
            UserId = Guid.Parse(userId),
            Email = user.FindFirst(ClaimTypes.Email)?.Value ?? string.Empty,
            FullName = user.FindFirst(ClaimTypes.Name)?.Value ?? string.Empty,
            OrganizationId = Guid.Parse(organizationId)
        };
    }
}
