using FlowForge.Application.Common.Responses;
using MediatR;

namespace FlowForge.Application.Features.Notifications.GetMyNotifications;

public sealed record GetMyNotificationsQuery : IRequest<ApiResponse<List<GetMyNotificationsResponse>>>;