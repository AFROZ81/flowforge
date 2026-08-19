using FlowForge.Application.Common.Responses;
using MediatR;

namespace FlowForge.Application.Features.Dashboard.GetWorkItemTrend;

public sealed record GetWorkItemTrendQuery : IRequest<ApiResponse<List<GetWorkItemTrendResponse>>>
{
    public int Days { get; init; } = 7;
}