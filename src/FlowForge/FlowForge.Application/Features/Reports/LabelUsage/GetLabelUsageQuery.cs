using FlowForge.Application.Common.Responses;
using MediatR;

namespace FlowForge.Application.Features.Reports.LabelUsage;

public sealed record GetLabelUsageQuery : IRequest<ApiResponse<List<GetLabelUsageResponse>>>;