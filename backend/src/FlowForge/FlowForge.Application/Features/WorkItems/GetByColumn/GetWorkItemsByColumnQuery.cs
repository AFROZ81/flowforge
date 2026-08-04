using FlowForge.Application.Common.Responses;
using MediatR;

namespace FlowForge.Application.Features.WorkItems.GetByColumn;

public sealed record GetWorkItemsByColumnQuery : IRequest<ApiResponse<List<GetWorkItemsByColumnResponse>>>
{
    public Guid ColumnId { get; init; }

    public bool IncludeArchived { get; init; } = false;
}