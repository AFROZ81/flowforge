using FlowForge.Application.Common.Responses;
using MediatR;

namespace FlowForge.Application.Features.Reports.ProductivityTrends;

public sealed record GetProductivityTrendsQuery : IRequest<ApiResponse<List<GetProductivityTrendsResponse>>>
{
    public int Days { get; init; } = 30;
}