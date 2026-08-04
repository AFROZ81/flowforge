using FlowForge.Application.Common.Responses;
using MediatR;

namespace FlowForge.Application.Features.Notifications.MarkAllAsRead;

public sealed record MarkAllNotificationsAsReadCommand : IRequest<ApiResponse<MarkAllNotificationsAsReadResponse>>;