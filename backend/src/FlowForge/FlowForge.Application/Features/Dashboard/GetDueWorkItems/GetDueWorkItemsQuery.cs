using FlowForge.Application.Common.Responses;
using MediatR;

namespace FlowForge.Application.Features.Dashboard.GetDueWorkItems;

public sealed record GetDueWorkItemsQuery : IRequest<ApiResponse<GetDueWorkItemsResponse>>;