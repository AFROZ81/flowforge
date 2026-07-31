using FlowForge.Application.Common.Responses;
using MediatR;

namespace FlowForge.Application.Features.Notifications.MarkAsRead;

public sealed record MarkNotificationAsReadCommand : IRequest<ApiResponse<MarkNotificationAsReadResponse>>
{
    public Guid NotificationId { get; init; }
}