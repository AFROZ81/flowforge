using FlowForge.Application.Common.Responses;
using MediatR;

namespace FlowForge.Application.Features.Checklists.Reorder;

public sealed record ReorderChecklistCommand : IRequest<ApiResponse<ReorderChecklistResponse>>
{
    public List<ReorderChecklistItemDto> Items { get; init; } = [];
}