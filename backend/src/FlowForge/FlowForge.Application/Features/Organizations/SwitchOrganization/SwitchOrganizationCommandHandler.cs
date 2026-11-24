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
        var user = _currentUser.User;

        // Check if user is a member of the target organization
        bool isMember = await _context.OrganizationUsers
            .AsNoTracking()
            .AnyAsync(
                ou => ou.UserId == user.UserId && ou.OrganizationId == request.OrganizationId,
                cancellationToken);

        if (!isMember)
        {
            throw new ForbiddenException("You are not a member of this organization.");
        }

        // Get user's role in the target organization
        var orgUser = await _context.OrganizationUsers
            .AsNoTracking()
            .FirstOrDefaultAsync(
                ou => ou.UserId == user.UserId && ou.OrganizationId == request.OrganizationId,
                cancellationToken);

        // Build authenticated user with switched organization
        var organizationIds = user.OrganizationIds;

        var authenticatedUser = new AuthenticatedUser
        {
            UserId = user.UserId,
            Email = user.Email,
            FullName = user.FullName,
            OrganizationId = request.OrganizationId,
            OrganizationIds = organizationIds,
            Role = orgUser?.Role ?? UserRole.Member
        };

        var token = _tokenService.GenerateAccessToken(authenticatedUser);

        return new SwitchOrganizationResponse
        {
            AccessToken = token.AccessToken,
            ExpiresAtUtc = token.ExpiresAtUtc
        };
    }
}