using FlowForge.Application.Common.Responses;
using MediatR;

namespace FlowForge.Application.Features.Checklists.Update;

public sealed record UpdateChecklistItemCommand : IRequest<ApiResponse<UpdateChecklistItemResponse>>
{
    public Guid ChecklistItemId { get; init; }

    public string Title { get; init; } = string.Empty;
}