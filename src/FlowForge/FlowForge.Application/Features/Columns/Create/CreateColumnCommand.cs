using FlowForge.Application.Common.Responses;
using MediatR;

namespace FlowForge.Application.Features.Columns.Create;

public sealed record CreateColumnCommand : IRequest<ApiResponse<CreateColumnResponse>>
{
    public Guid BoardId { get; init; }

    public string Name { get; init; } = string.Empty;

    public string? Description { get; init; }
}