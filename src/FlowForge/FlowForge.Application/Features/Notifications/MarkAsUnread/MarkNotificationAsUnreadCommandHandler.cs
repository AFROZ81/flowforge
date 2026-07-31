using FlowForge.Application.Common.Responses;
using FlowForge.Application.Interfaces;
using FlowForge.Application.Services.Authentication;
using MediatR;

namespace FlowForge.Application.Features.Notifications.MarkAsUnread;

public sealed class MarkNotificationAsUnreadCommandHandler : IRequestHandler<MarkNotificationAsUnreadCommand, ApiResponse<MarkNotificationAsUnreadResponse>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly NotificationRules _notificationRules;

    public MarkNotificationAsUnreadCommandHandler(IApplicationDbContext context, ICurrentUserService currentUser, NotificationRules notificationRules)
    {
        _context = context;
        _currentUser = currentUser;
        _notificationRules = notificationRules;
    }

    public async Task<ApiResponse<MarkNotificationAsUnreadResponse>> Handle(MarkNotificationAsUnreadCommand request, CancellationToken cancellationToken)
    {
        var currentUser = _currentUser.User;

        var notification = await _notificationRules.GetByIdAsync(request.NotificationId, currentUser.OrganizationId, currentUser.UserId, cancellationToken);

        notification.MarkAsUnread();

        await _context.SaveChangesAsync(cancellationToken);

        return ApiResponse<MarkNotificationAsUnreadResponse>
            .SuccessResponse(
                new MarkNotificationAsUnreadResponse
                {
                    Id = notification.Id,
                    IsRead = notification.IsRead,
                    ReadAt = notification.ReadAt
                },
                "Notification marked as unread successfully.");
    }
}