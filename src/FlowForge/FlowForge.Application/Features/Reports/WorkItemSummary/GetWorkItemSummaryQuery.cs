using FlowForge.Application.Common.Responses;
using MediatR;

namespace FlowForge.Application.Features.Reports.WorkItemSummary;

public sealed record GetWorkItemSummaryQuery : IRequest<ApiResponse<GetWorkItemSummaryResponse>>;