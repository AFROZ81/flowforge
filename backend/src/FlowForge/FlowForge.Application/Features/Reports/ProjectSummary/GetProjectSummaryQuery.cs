using FlowForge.Application.Common.Responses;
using MediatR;

namespace FlowForge.Application.Features.Reports.ProjectSummary;

public sealed record GetProjectSummaryQuery : IRequest<ApiResponse<List<GetProjectSummaryResponse>>>;