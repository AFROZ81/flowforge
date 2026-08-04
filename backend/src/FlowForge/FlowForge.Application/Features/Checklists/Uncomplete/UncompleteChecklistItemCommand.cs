using FlowForge.Application.Common.Responses;
using MediatR;

namespace FlowForge.Application.Features.Checklists.Uncomplete;

public sealed record UncompleteChecklistItemCommand : IRequest<ApiResponse<UncompleteChecklistItemResponse>>
{
    public Guid ChecklistItemId { get; init; }
}