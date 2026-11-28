using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text.Json;
using FlowForge.Application.Features.Authentication.CurrentUser;
using FlowForge.Application.Services.Authentication;
using FlowForge.Domain.Enums;
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

        var organizationIdClaim = user.FindFirst("organizationId")?.Value;
        var organizationId = Guid.Empty;

        if (string.IsNullOrWhiteSpace(userId))
        {
            if (required)
                throw new UnauthorizedAccessException("UserId claim is missing.");

            return null;
        }

        if (!string.IsNullOrWhiteSpace(organizationIdClaim))
        {
            if (!Guid.TryParse(organizationIdClaim, out organizationId))
            {
                if (required)
                    throw new UnauthorizedAccessException("OrganizationId claim is invalid.");

                return null;
            }
        }
        else if (required)
        {
            throw new UnauthorizedAccessException("OrganizationId claim is missing.");
        }

        // Parse organizationIds claim
        var orgIdsClaim = user.FindFirst("orgIds")?.Value;
        var organizationIds = new List<Guid>();
        if (!string.IsNullOrWhiteSpace(orgIdsClaim))
        {
            try
            {
                organizationIds = JsonSerializer.Deserialize<List<Guid>>(orgIdsClaim) ?? new List<Guid>();
            }
            catch
            {
                // Ignore parsing errors
            }
        }

        Guid? membershipId = null;
        var membershipIdClaim = user.FindFirst("membershipId")?.Value;
        if (Guid.TryParse(membershipIdClaim, out var parsedMembershipId))
            membershipId = parsedMembershipId;

        var tokenVersion = 0;
        var tokenVersionClaim = user.FindFirst("tokenVersion")?.Value;
        if (int.TryParse(tokenVersionClaim, out var parsedTokenVersion))
            tokenVersion = parsedTokenVersion;

        // Parse role claim
        var roleClaim = user.FindFirst(ClaimTypes.Role)?.Value;
        var role = UserRole.Member;
        if (!string.IsNullOrWhiteSpace(roleClaim) && Enum.TryParse<UserRole>(roleClaim, out var parsedRole))
        {
            role = parsedRole;
        }

        return new AuthenticatedUser
        {
            UserId = Guid.Parse(userId),
            Email = user.FindFirst(ClaimTypes.Email)?.Value ?? string.Empty,
            FullName = user.FindFirst(ClaimTypes.Name)?.Value ?? string.Empty,
            OrganizationId = organizationId,
            MembershipId = membershipId,
            TokenVersion = tokenVersion,
            OrganizationIds = organizationIds,
            Role = role
        };
    }
}
