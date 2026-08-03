using FlowForge.Application.Common.Responses;
using MediatR;

namespace FlowForge.Application.Features.Search.WorkItems;

public sealed record SearchWorkItemsQuery : IRequest<ApiResponse<List<SearchWorkItemsResponse>>>
{
    public Guid? ProjectId { get; init; }

    public Guid? BoardId { get; init; }

    public Guid? ColumnId { get; init; }

    public Guid? AssigneeId { get; init; }

    public Guid? LabelId { get; init; }

    public Guid? WatcherId { get; init; }

    public Guid? CreatedBy { get; init; }

    public string? Keyword { get; init; }

    public bool? IsArchived { get; init; }

    public DateTime? CreatedFrom { get; init; }

    public DateTime? CreatedTo { get; init; }

    public int Page { get; init; } = 1;

    public int PageSize { get; init; } = 20;
}