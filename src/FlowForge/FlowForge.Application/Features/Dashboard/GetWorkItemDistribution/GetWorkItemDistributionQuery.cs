using FlowForge.Application.Common.Responses;
using MediatR;

namespace FlowForge.Application.Features.Dashboard.GetWorkItemDistribution;

public sealed record GetWorkItemDistributionQuery : IRequest<ApiResponse<GetWorkItemDistributionResponse>>;