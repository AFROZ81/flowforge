using FlowForge.Application.Common.Responses;
using MediatR;

namespace FlowForge.Application.Features.Notifications.GetUnreadCount;

public sealed record GetUnreadCountQuery : IRequest<ApiResponse<GetUnreadCountResponse>>;