using FlowForge.Application.Common.Responses;
using MediatR;

namespace FlowForge.Application.Features.Notifications.MarkAsUnread;

public sealed record MarkNotificationAsUnreadCommand : IRequest<ApiResponse<MarkNotificationAsUnreadResponse>>
{
    public Guid NotificationId { get; init; }
}