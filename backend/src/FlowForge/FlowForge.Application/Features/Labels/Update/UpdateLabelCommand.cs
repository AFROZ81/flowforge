using FlowForge.Application.Common.Responses;
using MediatR;

namespace FlowForge.Application.Features.Labels.Update;

public sealed record UpdateLabelCommand : IRequest<ApiResponse<UpdateLabelResponse>>
{
    public Guid LabelId { get; init; }

    public string Name { get; init; } = string.Empty;

    public string Color { get; init; } = string.Empty;

    public string? Description { get; init; }
}