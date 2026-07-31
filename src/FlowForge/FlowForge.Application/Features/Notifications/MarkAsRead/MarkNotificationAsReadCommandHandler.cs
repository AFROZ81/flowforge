using FlowForge.Application.Common.Responses;
using FlowForge.Application.Interfaces;
using FlowForge.Application.Services.Authentication;
using MediatR;

namespace FlowForge.Application.Features.Notifications.MarkAsRead;

public sealed class MarkNotificationAsReadCommandHandler : IRequestHandler<MarkNotificationAsReadCommand, ApiResponse<MarkNotificationAsReadResponse>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly NotificationRules _notificationRules;

    public MarkNotificationAsReadCommandHandler(IApplicationDbContext context, ICurrentUserService currentUser, NotificationRules notificationRules)
    {
        _context = context;
        _currentUser = currentUser;
        _notificationRules = notificationRules;
    }

    public async Task<ApiResponse<MarkNotificationAsReadResponse>> Handle(MarkNotificationAsReadCommand request, CancellationToken cancellationToken)
    {
        var currentUser = _currentUser.User;

        var notification = await _notificationRules.GetByIdAsync(request.NotificationId, currentUser.OrganizationId, currentUser.UserId, cancellationToken);

        notification.MarkAsRead();

        await _context.SaveChangesAsync(cancellationToken);

        return ApiResponse<MarkNotificationAsReadResponse>
            .SuccessResponse(
                new MarkNotificationAsReadResponse
                {
                    Id = notification.Id,
                    IsRead = notification.IsRead,
                    ReadAt = notification.ReadAt
                },
                "Notification marked as read successfully.");
    }
}