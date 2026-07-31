using FlowForge.Application.Common.Responses;
using MediatR;

namespace FlowForge.Application.Features.Labels.Remove;

public sealed record RemoveLabelCommand : IRequest<ApiResponse<RemoveLabelResponse>>
{
    public Guid WorkItemId { get; init; }

    public Guid LabelId { get; init; }
}