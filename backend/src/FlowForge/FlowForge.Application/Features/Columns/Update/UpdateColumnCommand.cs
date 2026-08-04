using FlowForge.Application.Common.Responses;
using MediatR;

namespace FlowForge.Application.Features.Columns.Update;

public sealed record UpdateColumnCommand : IRequest<ApiResponse<UpdateColumnResponse>>
{
    public Guid Id { get; init; }

    public string Name { get; init; } = string.Empty;

    public string? Description { get; init; }
}