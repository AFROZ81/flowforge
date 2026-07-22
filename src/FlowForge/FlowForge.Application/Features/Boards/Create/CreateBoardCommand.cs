using FlowForge.Application.Common.Responses;
using MediatR;

namespace FlowForge.Application.Features.Boards.Create;

public sealed record CreateBoardCommand : IRequest<ApiResponse<CreateBoardResponse>>
{
    public Guid ProjectId { get; init; }

    public string Name { get; init; } = string.Empty;

    public string? Description { get; init; }
}