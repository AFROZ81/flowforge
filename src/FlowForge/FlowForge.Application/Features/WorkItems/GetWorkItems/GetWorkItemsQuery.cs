using FlowForge.Application.Common.Responses;
using FlowForge.Domain.Common.Enums;
using MediatR;

namespace FlowForge.Application.Features.WorkItems.GetWorkItems;

public sealed record GetWorkItemsQuery : IRequest<ApiResponse<List<GetWorkItemsResponse>>>
{
    public Guid? ColumnId { get; init; }

    public string? Search { get; init; }

    public WorkItemPriority? Priority { get; init; }

    public WorkItemStatus? Status { get; init; }

    public bool? IsArchived { get; init; }

    public DateTime? DueBefore { get; init; }

    public DateTime? DueAfter { get; init; }
}