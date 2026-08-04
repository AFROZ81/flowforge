using FlowForge.Application.Common.Responses;
using MediatR;

namespace FlowForge.Application.Features.WorkItems.Move;

public sealed record MoveWorkItemCommand : IRequest<ApiResponse<MoveWorkItemResponse>>
{
    public Guid WorkItemId { get; init; }

    public Guid DestinationColumnId { get; init; }

    public int DestinationIndex { get; init; }
}