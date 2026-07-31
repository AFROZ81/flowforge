using FlowForge.Application.Common.Responses;
using FlowForge.Application.Interfaces;
using FlowForge.Application.Services.Authentication;
using MediatR;

namespace FlowForge.Application.Features.Notifications.Delete;

public sealed class DeleteNotificationCommandHandler : IRequestHandler<DeleteNotificationCommand, ApiResponse<DeleteNotificationResponse>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly NotificationRules _notificationRules;

    public DeleteNotificationCommandHandler(IApplicationDbContext context, ICurrentUserService currentUser, NotificationRules notificationRules)
    {
        _context = context;
        _currentUser = currentUser;
        _notificationRules = notificationRules;
    }

    public async Task<ApiResponse<DeleteNotificationResponse>> Handle(DeleteNotificationCommand request, CancellationToken cancellationToken)
    {
        var currentUser = _currentUser.User;

        var notification = await _notificationRules.GetByIdAsync(request.NotificationId, currentUser.OrganizationId, currentUser.UserId, cancellationToken);

        notification.Delete();

        await _context.SaveChangesAsync(cancellationToken);

        return ApiResponse<DeleteNotificationResponse>
            .SuccessResponse(
                new DeleteNotificationResponse
                {
                    Id = notification.Id,
                    IsDeleted = notification.IsDeleted,
                    DeletedAt = notification.DeletedAt
                },
                "Notification deleted successfully.");
    }
}