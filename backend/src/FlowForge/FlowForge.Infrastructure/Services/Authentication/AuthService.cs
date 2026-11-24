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

            if (!string.Equals(invitation.Email.Trim(), request.Email.Trim(), StringComparison.OrdinalIgnoreCase))
                throw new BadRequestException("Registration email must match the invited email address.");
        }
        else
        {
            var organizationExists = await _context.Organizations
                .AnyAsync(x => x.Id == request.OrganizationId, cancellationToken);

            if (!organizationExists)
                throw new NotFoundException("Organization not found.");
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
            Role = invitation?.Role ?? (await _context.OrganizationUsers
                .AsNoTracking()
                .CountAsync(ou => ou.OrganizationId == request.OrganizationId, cancellationToken) == 0
                ? UserRole.Admin
                : UserRole.Member)
        };

        IdentityResult result = await _userManager.CreateAsync(user, request.Password);

        if (!result.Succeeded)
        {
            throw new BadRequestException(string.Join(Environment.NewLine, result.Errors.Select(x => x.Description)));
        }

        if (invitation is null)
        {
            var orgUser = new OrganizationUser
            {
                UserId = user.Id,
                OrganizationId = request.OrganizationId,
                Role = user.Role
            };

            _context.OrganizationUsers.Add(orgUser);
            await _context.SaveChangesAsync(cancellationToken);
        }

        AcceptInvitationResponse? acceptance = null;

        if (invitation is not null)
        {
            acceptance = await _mediator.Send(
                new AcceptInvitationCommand { Token = invitation.Token },
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
            AccessToken = acceptance?.AccessToken,
            ExpiresAtUtc = acceptance?.ExpiresAtUtc
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

        var organizationUsers = await _context.OrganizationUsers
            .AsNoTracking()
            .Where(ou => ou.UserId == user.Id)
            .ToListAsync();

        if (!organizationUsers.Any())
            throw new UnauthorizedException("User is not a member of any organization.");

        var organizationIds = organizationUsers.Select(ou => ou.OrganizationId).ToList();

        // Get the role from the first organization (default organization)
        var firstOrgUser = organizationUsers.First();
        var role = firstOrgUser.Role;

        var authenticatedUser = new AuthenticatedUser
        {
            UserId = user.Id,
            Email = user.Email!,
            FullName = user.FullName,
            OrganizationId = firstOrgUser.OrganizationId,
            OrganizationIds = organizationIds,
            Role = role
        };

        var token = _tokenService.GenerateAccessToken(authenticatedUser);

        return new LoginResponse
        {
            AccessToken = token.AccessToken,
            ExpiresAtUtc = token.ExpiresAtUtc
        };
    }

    public async Task<LoginResponse> RefreshTokenAsync(AuthenticatedUser user)
    {
        var token = _tokenService.GenerateAccessToken(user);

        return new LoginResponse
        {
            AccessToken = token.AccessToken,
            ExpiresAtUtc = token.ExpiresAtUtc
        };
    }
}