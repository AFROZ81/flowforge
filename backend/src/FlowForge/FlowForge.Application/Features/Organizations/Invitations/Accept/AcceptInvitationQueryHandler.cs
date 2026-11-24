using FlowForge.Application.Common.Exceptions;
using FlowForge.Application.Features.Organizations.Invitations.Accept;
using FlowForge.Application.Interfaces;
using FlowForge.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FlowForge.Application.Features.Organizations.Invitations.Accept;

/// <summary>
/// Handles <see cref="AcceptInvitationQuery"/>.
/// </summary>
public sealed class AcceptInvitationQueryHandler : IRequestHandler<AcceptInvitationQuery, AcceptInvitationQueryResponse>
{
    private readonly IApplicationDbContext _context;

    public AcceptInvitationQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<AcceptInvitationQueryResponse> Handle(AcceptInvitationQuery request, CancellationToken cancellationToken)
    {
        var invitation = await _context.OrganizationInvitations
            .Include(i => i.Organization)
            .AsNoTracking()
            .FirstOrDefaultAsync(i => i.Token == request.Token && !i.IsDeleted, cancellationToken);

        if (invitation is null)
            throw new NotFoundException("Invalid or expired invitation token.");

        return new AcceptInvitationQueryResponse
        {
            Email = invitation.Email,
            OrganizationName = invitation.Organization?.Name ?? string.Empty,
            Role = invitation.Role.ToString(),
            ExpiresAt = invitation.ExpiresAt,
            IsAccepted = invitation.IsAccepted
        };
    }
}
