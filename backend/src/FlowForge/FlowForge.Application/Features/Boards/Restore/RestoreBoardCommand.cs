using FlowForge.Application.Common.Responses;
using MediatR;

namespace FlowForge.Application.Features.Boards.Restore;

public sealed record RestoreBoardCommand : IRequest<ApiResponse<RestoreBoardResponse>>
{
    public Guid BoardId { get; init; }
}