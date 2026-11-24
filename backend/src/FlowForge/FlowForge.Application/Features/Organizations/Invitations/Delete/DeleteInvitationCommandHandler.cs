using FlowForge.Application.Common.Exceptions;
using FlowForge.Application.Features.Organizations.Invitations.Delete;
using FlowForge.Application.Interfaces;
using FlowForge.Application.Services.Authentication;
using FlowForge.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FlowForge.Application.Features.Organizations.Invitations.Delete;

/// <summary>
/// Handles <see cref="DeleteInvitationCommand"/>.
/// </summary>
public sealed class DeleteInvitationCommandHandler : IRequestHandler<DeleteInvitationCommand>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public DeleteInvitationCommandHandler(IApplicationDbContext context, ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task Handle(DeleteInvitationCommand request, CancellationToken cancellationToken)
    {
        var currentUser = _currentUser.User;

        var invitation = await _context.OrganizationInvitations
            .FirstOrDefaultAsync(i => i.Id == request.Id && !i.IsDeleted, cancellationToken);

        if (invitation is null)
            throw new NotFoundException("Invitation not found.");

        // Check if user is admin of the organization
        var isAdmin = await _context.OrganizationUsers
            .AsNoTracking()
            .AnyAsync(
                ou => ou.UserId == _currentUser.User.UserId &&
                      ou.OrganizationId == invitation.OrganizationId &&
                      ou.Role == UserRole.Admin,
                cancellationToken);

        if (!isAdmin)
            throw new ForbiddenException("Only organization admins can revoke invitations.");

        invitation.IsDeleted = true;
        await _context.SaveChangesAsync(cancellationToken);
    }
}