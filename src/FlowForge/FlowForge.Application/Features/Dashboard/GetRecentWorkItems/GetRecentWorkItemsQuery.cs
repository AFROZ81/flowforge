using FlowForge.Application.Common.Responses;
using MediatR;

namespace FlowForge.Application.Features.Dashboard.GetRecentWorkItems;

public sealed record GetRecentWorkItemsQuery : IRequest<ApiResponse<List<GetRecentWorkItemsResponse>>>;