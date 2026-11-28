using FlowForge.Application.Common.Exceptions;
using FlowForge.Application.Features.Authentication.CurrentUser;
using FlowForge.Application.Features.Organizations.SwitchOrganization;
using FlowForge.Application.Interfaces;
using FlowForge.Application.Services.Authentication;
using FlowForge.Domain.Entities;
using FlowForge.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FlowForge.Application.Features.Organizations.SwitchOrganization;

/// <summary>
/// Handles <see cref="SwitchOrganizationCommand"/>.
/// </summary>
public sealed class SwitchOrganizationCommandHandler : IRequestHandler<SwitchOrganizationCommand, SwitchOrganizationResponse>
{
    private readonly IApplicationDbContext _context;
    private readonly ITokenService _tokenService;
    private readonly ICurrentUserService _currentUser;

    public SwitchOrganizationCommandHandler(
        IApplicationDbContext context,
        ITokenService tokenService,
        ICurrentUserService currentUser)
    {
        _context = context;
        _tokenService = tokenService;
        _currentUser = currentUser;
    }

    public async Task<SwitchOrganizationResponse> Handle(SwitchOrganizationCommand request, CancellationToken cancellationToken)
    {
        var user = _currentUser.TryGetUser()
            ?? throw new UnauthorizedAccessException("User is not authenticated.");

        var orgUser = await _context.OrganizationUsers
            .AsNoTracking()
            .FirstOrDefaultAsync(
                ou => ou.UserId == user.UserId &&
                      ou.OrganizationId == request.OrganizationId &&
                      !ou.IsDeleted &&
                      ou.Organization.IsActive &&
                      !ou.Organization.IsDeleted,
                cancellationToken);

        if (orgUser is null)
        {
            throw new ForbiddenException("You are not an active member of this organization.");
        }

        var organizationIds = await _context.OrganizationUsers
            .AsNoTracking()
            .Where(ou => ou.UserId == user.UserId &&
                        !ou.IsDeleted &&
                        ou.Organization.IsActive &&
                        !ou.Organization.IsDeleted)
            .Select(ou => ou.OrganizationId)
            .Distinct()
            .ToListAsync(cancellationToken);

        var authenticatedUser = new AuthenticatedUser
        {
            UserId = user.UserId,
            Email = user.Email,
            FullName = user.FullName,
            OrganizationId = request.OrganizationId,
            MembershipId = orgUser.Id,
            TokenVersion = orgUser.TokenVersion,
            OrganizationIds = organizationIds,
            Role = orgUser.Role
        };

        var token = _tokenService.GenerateAccessToken(authenticatedUser);

        return new SwitchOrganizationResponse
        {
            AccessToken = token.AccessToken,
            ExpiresAtUtc = token.ExpiresAtUtc,
            OrganizationId = request.OrganizationId
        };
    }
}