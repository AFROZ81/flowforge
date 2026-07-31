using FlowForge.Application.Common.Responses;
using FlowForge.Application.Interfaces;
using FlowForge.Application.Services.Authentication;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FlowForge.Application.Features.Notifications.GetUnreadCount;

public sealed class GetUnreadCountQueryHandler : IRequestHandler<GetUnreadCountQuery, ApiResponse<GetUnreadCountResponse>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public GetUnreadCountQueryHandler(IApplicationDbContext context, ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<ApiResponse<GetUnreadCountResponse>> Handle(GetUnreadCountQuery request, CancellationToken cancellationToken)
    {
        var currentUser = _currentUser.User;

        var unreadCount = await _context.Notifications
            .AsNoTracking()
            .CountAsync(
                x =>
                    x.OrganizationId == currentUser.OrganizationId &&
                    x.RecipientId == currentUser.UserId &&
                    !x.IsDeleted &&
                    !x.IsRead,
                cancellationToken);

        return ApiResponse<GetUnreadCountResponse>
            .SuccessResponse(
                new GetUnreadCountResponse
                {
                    UnreadCount = unreadCount
                },
                "Unread notification count retrieved successfully.");
    }
}