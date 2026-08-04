using FlowForge.Application.Common.Responses;
using MediatR;

namespace FlowForge.Application.Features.Checklists.Delete;

public sealed record DeleteChecklistItemCommand : IRequest<ApiResponse<DeleteChecklistItemResponse>>
{
    public Guid ChecklistItemId { get; init; }
}