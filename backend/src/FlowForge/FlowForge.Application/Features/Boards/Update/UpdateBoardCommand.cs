using FlowForge.Application.Common.Responses;
using MediatR;

namespace FlowForge.Application.Features.Boards.Update;

public sealed record UpdateBoardCommand : IRequest<ApiResponse<UpdateBoardResponse>>
{
    public Guid BoardId { get; init; }

    public string Name { get; init; } = string.Empty;

    public string? Description { get; init; }
}