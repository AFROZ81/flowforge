using FlowForge.Application.Common.Responses;
using MediatR;

namespace FlowForge.Application.Features.Columns.Archive;

public sealed record ArchiveColumnCommand : IRequest<ApiResponse<ArchiveColumnResponse>>
{
    public Guid Id { get; init; }
}