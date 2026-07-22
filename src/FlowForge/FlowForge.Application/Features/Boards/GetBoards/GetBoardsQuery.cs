using FlowForge.Application.Common.Pagination;
using FlowForge.Application.Common.Responses;
using MediatR;

namespace FlowForge.Application.Features.Boards.GetBoards;

public sealed record GetBoardsQuery : PagedRequest, IRequest<ApiResponse<PagedResponse<GetBoardsResponse>>>
{
    public Guid ProjectId { get; init; }

    public bool IncludeArchived { get; init; } = false;
}