using FlowForge.Application.Common.Responses;
using MediatR;

namespace FlowForge.Application.Features.Checklists.Complete;

public sealed record CompleteChecklistItemCommand : IRequest<ApiResponse<CompleteChecklistItemResponse>>
{
    public Guid ChecklistItemId { get; init; }
}