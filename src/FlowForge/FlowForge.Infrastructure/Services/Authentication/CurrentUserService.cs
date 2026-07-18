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

            return new AuthenticatedUser
            {
                UserId = Guid.Parse(
                    user.FindFirst(ClaimTypes.NameIdentifier)?.Value!),

                Email = user.FindFirst(ClaimTypes.Email)?.Value ?? string.Empty,

                FullName = user.FindFirst(ClaimTypes.Name)?.Value ?? string.Empty,

                OrganizationId = Guid.Parse(
                    user.FindFirst("OrganizationId")?.Value!)
            };
        }
    }
}