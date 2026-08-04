using FlowForge.Application.Common.Responses;
using MediatR;

namespace FlowForge.Application.Features.Dashboard.GetOverview;

public sealed record GetDashboardOverviewQuery : IRequest<ApiResponse<GetDashboardOverviewResponse>>;