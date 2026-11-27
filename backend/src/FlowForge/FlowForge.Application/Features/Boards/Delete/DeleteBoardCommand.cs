using FlowForge.Application.Common.Responses;
using MediatR;

namespace FlowForge.Application.Features.Boards.Delete;

public sealed record DeleteBoardCommand : IRequest<ApiResponse<DeleteBoardResponse>>
{
    public Guid BoardId { get; init; }
}
