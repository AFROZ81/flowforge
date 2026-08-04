using FlowForge.Application.Common.Responses;
using MediatR;

namespace FlowForge.Application.Features.Checklists.Create;

public sealed record CreateChecklistItemCommand : IRequest<ApiResponse<CreateChecklistItemResponse>>
{
    public Guid WorkItemId { get; init; }

    public string Title { get; init; } = string.Empty;
}