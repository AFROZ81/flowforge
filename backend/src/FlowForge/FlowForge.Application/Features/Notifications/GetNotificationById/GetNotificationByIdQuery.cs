using FlowForge.Application.Common.Responses;
using MediatR;

namespace FlowForge.Application.Features.Notifications.GetNotificationById;

public sealed record GetNotificationByIdQuery : IRequest<ApiResponse<GetNotificationByIdResponse>>
{
    public Guid NotificationId { get; init; }
}