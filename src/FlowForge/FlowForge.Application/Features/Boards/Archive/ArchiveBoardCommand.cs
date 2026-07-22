using FlowForge.Application.Common.Responses;
using MediatR;

namespace FlowForge.Application.Features.Boards.Archive;

public sealed record ArchiveBoardCommand : IRequest<ApiResponse<ArchiveBoardResponse>>
{
    public Guid BoardId { get; init; }
}