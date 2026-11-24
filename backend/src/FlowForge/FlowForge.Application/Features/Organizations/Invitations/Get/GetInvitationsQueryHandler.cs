using FlowForge.Application.Features.Organizations.Invitations.Get;
using FlowForge.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace FlowForge.Application.Features.Organizations.Invitations.Get;

/// <summary>
/// Handles <see cref="GetInvitationsQuery"/>.
/// </summary>
public sealed class GetInvitationsQueryHandler : IRequestHandler<GetInvitationsQuery, List<GetInvitationsResponse>>
{
    private readonly IApplicationDbContext _context;
    private readonly IUserLookupService _userLookup;
    private readonly ILogger<GetInvitationsQueryHandler> _logger;

    public GetInvitationsQueryHandler(
        IApplicationDbContext context,
        IUserLookupService userLookup,
        ILogger<GetInvitationsQueryHandler> logger)
    {
        _context = context;
        _userLookup = userLookup;
        _logger = logger;
    }

    public async Task<List<GetInvitationsResponse>> Handle(GetInvitationsQuery request, CancellationToken cancellationToken)
    {
        // List only non-deleted invitations for the caller's organization.
        // An invitation is shown regardless of acceptance/expiry status so the
        // UI can render accepted, expired, and pending invitations consistently.
        var invitations = await _context.OrganizationInvitations
            .AsNoTracking()
            .Where(i => i.OrganizationId == request.OrganizationId && !i.IsDeleted)
            .OrderByDescending(i => i.CreatedAt)
        .Select(i => new
        {
            i.Id,
            i.Email,
            i.Role,
            i.IsAccepted,
            i.ExpiresAt,
            i.CreatedAt,
            i.InvitedByUserId,
            i.EmailStatus,
            i.EmailError,
        })
            .ToListAsync(cancellationToken);

        // Diagnostics: log the scope and counts so any listing/duplicate-check
        // discrepancy can be diagnosed. No tokens or credentials are logged.
        _logger.LogDebug(
            "Listed {Count} invitations for Organization {OrganizationId}.",
            invitations.Count,
            request.OrganizationId);

        // Get unique invited by user IDs
        var invitedByUserIds = invitations.Select(i => i.InvitedByUserId).Distinct().ToList();

        // Look up user names
        var userNames = new Dictionary<Guid, string>();
        foreach (var userId in invitedByUserIds)
        {
            var user = await _userLookup.FindByIdAsync(userId, cancellationToken);
            if (user is not null)
            {
                userNames[userId] = user.FullName;
            }
        }

        return invitations.Select(i => new GetInvitationsResponse
        {
            Id = i.Id,
            Email = i.Email,
            Role = i.Role,
            IsAccepted = i.IsAccepted,
            ExpiresAt = i.ExpiresAt,
            CreatedAt = i.CreatedAt,
            InvitedByName = userNames.GetValueOrDefault(i.InvitedByUserId, "Unknown"),
            EmailStatus = i.EmailStatus,
            EmailError = i.EmailError,
        }).ToList();
    }
}