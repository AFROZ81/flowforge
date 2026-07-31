using FlowForge.Application.Common.Responses;
using FlowForge.Application.Services.Authentication;
using MediatR;

namespace FlowForge.Application.Features.Notifications.GetNotificationById;

public sealed class GetNotificationByIdQueryHandler : IRequestHandler<GetNotificationByIdQuery, ApiResponse<GetNotificationByIdResponse>>
{
    private readonly ICurrentUserService _currentUser;
    private readonly NotificationRules _notificationRules;

    public GetNotificationByIdQueryHandler(ICurrentUserService currentUser, NotificationRules notificationRules)
    {
        _currentUser = currentUser;
        _notificationRules = notificationRules;
    }

    public async Task<ApiResponse<GetNotificationByIdResponse>> Handle(GetNotificationByIdQuery request, CancellationToken cancellationToken)
    {
        var currentUser = _currentUser.User;

        var notification = await _notificationRules.GetByIdAsync(request.NotificationId, currentUser.OrganizationId, currentUser.UserId, cancellationToken);

        return ApiResponse<GetNotificationByIdResponse>
            .SuccessResponse(
                new GetNotificationByIdResponse
                {
                    Id = notification.Id,
                    Type = notification.Type.ToString(),
                    Title = notification.Title,
                    Message = notification.Message,
                    WorkItemId = notification.WorkItemId,
                    IsRead = notification.IsRead,
                    ReadAt = notification.ReadAt,
                    CreatedAt = notification.CreatedAt
                },
                "Notification retrieved successfully.");
    }
}