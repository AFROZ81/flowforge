using FlowForge.Application.Common.Responses;
using MediatR;

namespace FlowForge.Application.Features.Reminders.Upcoming;

public sealed record GetUpcomingRemindersQuery : IRequest<ApiResponse<List<GetUpcomingRemindersResponse>>>
{
    public int Days { get; init; } = 7;
}