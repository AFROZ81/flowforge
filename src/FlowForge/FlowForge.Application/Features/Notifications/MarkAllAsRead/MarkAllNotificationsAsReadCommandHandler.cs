using FlowForge.Application.Common.Responses;
using FlowForge.Application.Interfaces;
using FlowForge.Application.Services.Authentication;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FlowForge.Application.Features.Notifications.MarkAllAsRead;

public sealed class MarkAllNotificationsAsReadCommandHandler : IRequestHandler<MarkAllNotificationsAsReadCommand, ApiResponse<MarkAllNotificationsAsReadResponse>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public MarkAllNotificationsAsReadCommandHandler(IApplicationDbContext context, ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<ApiResponse<MarkAllNotificationsAsReadResponse>> Handle(MarkAllNotificationsAsReadCommand request, CancellationToken cancellationToken)
    {
        var currentUser = _currentUser.User;

        var notifications = await _context.Notifications
            .Where(x =>
                x.OrganizationId == currentUser.OrganizationId &&
                x.RecipientId == currentUser.UserId &&
                !x.IsDeleted &&
                !x.IsRead)
            .ToListAsync(cancellationToken);

        foreach (var notification in notifications)
        {
            notification.MarkAsRead();
        }

        await _context.SaveChangesAsync(cancellationToken);

        return ApiResponse<MarkAllNotificationsAsReadResponse>
            .SuccessResponse(
                new MarkAllNotificationsAsReadResponse
                {
                    MarkedAsReadCount = notifications.Count
                },
                "All notifications marked as read successfully.");
    }
}