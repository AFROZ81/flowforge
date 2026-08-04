using FlowForge.Application.Common.Responses;
using MediatR;

namespace FlowForge.Application.Features.Notifications.Delete;

public sealed record DeleteNotificationCommand : IRequest<ApiResponse<DeleteNotificationResponse>>
{
    public Guid NotificationId { get; init; }
}