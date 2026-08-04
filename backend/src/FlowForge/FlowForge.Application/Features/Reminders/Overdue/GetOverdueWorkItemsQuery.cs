using FlowForge.Application.Common.Responses;
using MediatR;

namespace FlowForge.Application.Features.Reminders.Overdue;

public sealed record GetOverdueWorkItemsQuery : IRequest<ApiResponse<List<GetOverdueWorkItemsResponse>>>;