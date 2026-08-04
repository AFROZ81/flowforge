using FlowForge.Application.Common.Responses;
using MediatR;

namespace FlowForge.Application.Features.Labels.Create;

public sealed record CreateLabelCommand : IRequest<ApiResponse<CreateLabelResponse>>
{
    public string Name { get; init; } = string.Empty;

    public string Color { get; init; } = string.Empty;

    public string? Description { get; init; }
}