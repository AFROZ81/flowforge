using FlowForge.Application.Features.Authentication.Register;
using FlowForge.Application.Interfaces;
using FlowForge.Application.Services.Authentication;
using FlowForge.Infrastructure.Identity;
using FlowForge.Application.Common.Exceptions;
using FlowForge.Application.Features.Authentication.Login;
using FlowForge.Application.Features.Authentication.CurrentUser;
using FlowForge.Application.Features.Organizations.Invitations.Accept;
using FlowForge.Domain.Entities;
using FlowForge.Domain.Enums;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using MediatR;

namespace FlowForge.Infrastructure.Services.Authentication;

/// <summary>
/// Handles authentication operations.
/// </summary>
public sealed class AuthService : IAuthService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IApplicationDbContext _context;
    private readonly ITokenService _tokenService;
    private readonly IMediator _mediator;

    public AuthService(
        UserManager<ApplicationUser> userManager,
        IApplicationDbContext context,
        ITokenService tokenService,
        IMediator mediator)
    {
        _userManager = userManager;
        _context = context;
        _tokenService = tokenService;
        _mediator = mediator;
    }

    public async Task<RegisterResponse> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken = default)
    {
        OrganizationInvitation? invitation = null;

        if (!string.IsNullOrWhiteSpace(request.InvitationToken))
        {
            invitation = await _context.OrganizationInvitations
                .Include(i => i.Organization)
                .AsNoTracking()
                .FirstOrDefaultAsync(
                    i => i.Token == request.InvitationToken && !i.IsDeleted,
                    cancellationToken);

            if (invitation is null)
                throw new NotFoundException("Invalid or expired invitation token.");

            if (invitation.IsAccepted)
                throw new BadRequestException("This invitation has already been accepted.");

            if (invitation.ExpiresAt < DateTime.UtcNow)
                throw new BadRequestException("This invitation has expired.");

            if (!invitation.Organization.IsActive || invitation.Organization.IsDeleted)
                throw new BadRequestException("This invitation's organization is not active.");

            if (!string.Equals(invitation.Email.Trim(), request.Email.Trim(), StringComparison.OrdinalIgnoreCase))
                throw new BadRequestException("Registration email must match the invited email address.");
        }

        var email = request.Email.Trim();
        var existingUser = await _userManager.FindByEmailAsync(email);

        if (existingUser is not null)
            throw new ConflictException("Email already registered.");

        var database = (_context as DbContext)?.Database;
        await using var transaction = invitation is not null && database?.IsRelational() == true
            ? await database.BeginTransactionAsync(cancellationToken)
            : null;

        var user = new ApplicationUser
        {
            Id = Guid.NewGuid(),
            FullName = request.FullName,
            UserName = email,
            Email = email,
            OrganizationId = Guid.Empty,
            Role = invitation?.Role ?? UserRole.Member
        };

        IdentityResult result = await _userManager.CreateAsync(user, request.Password);

        if (!result.Succeeded)
        {
            throw new BadRequestException(string.Join(Environment.NewLine, result.Errors.Select(x => x.Description)));
        }

        TokenResult? accountToken = null;
        AcceptInvitationResponse? acceptance = null;

        if (invitation is null)
        {
            accountToken = _tokenService.GenerateAccessToken(new AuthenticatedUser
            {
                UserId = user.Id,
                Email = user.Email,
                FullName = user.FullName,
                OrganizationId = Guid.Empty,
                OrganizationIds = [],
                Role = UserRole.Member
            });
        }
        else
        {
            acceptance = await _mediator.Send(
                new AcceptInvitationCommand
                {
                    Token = invitation.Token,
                    AcceptingUserId = user.Id
                },
                cancellationToken);
        }

        if (transaction is not null)
            await transaction.CommitAsync(cancellationToken);

        return new RegisterResponse
        {
            UserId = user.Id,
            Message = acceptance is null
                ? "User registered successfully."
                : "User registered and invitation accepted successfully.",
            AccessToken = acceptance?.AccessToken ?? accountToken?.AccessToken,
            ExpiresAtUtc = acceptance?.ExpiresAtUtc ?? accountToken?.ExpiresAtUtc
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

        var memberships = await GetActiveMembershipsAsync(user.Id, cancellationToken: default);
        var authenticatedUser = memberships.Count > 0
            ? CreateOrganizationSession(user, memberships, memberships[0])
            : CreateAccountSession(user);

        var token = _tokenService.GenerateAccessToken(authenticatedUser);

        return new LoginResponse
        {
            AccessToken = token.AccessToken,
            ExpiresAtUtc = token.ExpiresAtUtc
        };
    }

    public async Task<LoginResponse> RefreshTokenAsync(AuthenticatedUser user)
    {
        var account = await _userManager.FindByIdAsync(user.UserId.ToString())
            ?? throw new UnauthorizedException("Account no longer exists.");

        var memberships = await GetActiveMembershipsAsync(account.Id);
        var currentIndex = memberships.FindIndex(
            x => x.Membership.OrganizationId == user.OrganizationId);

        var authenticatedUser = memberships.Count > 0
            ? CreateOrganizationSession(
                account,
                memberships,
                currentIndex >= 0 ? memberships[currentIndex] : memberships[0])
            : CreateAccountSession(account);

        var token = _tokenService.GenerateAccessToken(authenticatedUser);

        return new LoginResponse
        {
            AccessToken = token.AccessToken,
            ExpiresAtUtc = token.ExpiresAtUtc
        };
    }

    private async Task<List<(OrganizationUser Membership, Organization Organization)>> GetActiveMembershipsAsync(
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        var rows = await _context.OrganizationUsers
            .AsNoTracking()
            .Where(x => x.UserId == userId && !x.IsDeleted)
            .Select(x => new
            {
                Membership = x,
                Organization = x.Organization
            })
            .OrderBy(x => x.Membership.CreatedAt)
            .ThenBy(x => x.Organization.Name)
            .ToListAsync(cancellationToken);

        return rows
            .Where(x => !x.Organization.IsDeleted && x.Organization.IsActive)
            .Select(x => (x.Membership, x.Organization))
            .ToList();
    }

    private static AuthenticatedUser CreateAccountSession(ApplicationUser user) => new()
    {
        UserId = user.Id,
        Email = user.Email ?? string.Empty,
        FullName = user.FullName,
        OrganizationId = Guid.Empty,
        OrganizationIds = [],
        Role = UserRole.Member
    };

    private static AuthenticatedUser CreateOrganizationSession(
        ApplicationUser user,
        List<(OrganizationUser Membership, Organization Organization)> memberships,
        (OrganizationUser Membership, Organization Organization) selected) => new()
    {
        UserId = user.Id,
        Email = user.Email ?? string.Empty,
        FullName = user.FullName,
        OrganizationId = selected.Membership.OrganizationId,
        MembershipId = selected.Membership.Id,
        TokenVersion = selected.Membership.TokenVersion,
        OrganizationIds = memberships
            .Select(x => x.Membership.OrganizationId)
            .Distinct()
            .ToList(),
        Role = selected.Membership.Role
    };
}
