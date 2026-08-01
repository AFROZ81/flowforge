using FlowForge.Application.Common.Responses;
using MediatR;

namespace FlowForge.Application.Features.Reports.AssigneeSummary;

public sealed record GetAssigneeSummaryQuery : IRequest<ApiResponse<List<GetAssigneeSummaryResponse>>>;