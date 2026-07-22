using FlowForge.Application.Common.Responses;
using MediatR;

namespace FlowForge.Application.Features.Boards.GetBoardById;

public sealed record GetBoardByIdQuery : IRequest<ApiResponse<GetBoardByIdResponse>>
{
    public Guid BoardId { get; init; }
}