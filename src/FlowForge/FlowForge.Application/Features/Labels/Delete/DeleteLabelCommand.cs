using FlowForge.Application.Common.Responses;
using MediatR;

namespace FlowForge.Application.Features.Labels.Delete;

public sealed record DeleteLabelCommand : IRequest<ApiResponse<DeleteLabelResponse>>
{
    public Guid LabelId { get; init; }
}