using FlowForge.Application.Common.Responses;
using MediatR;

namespace FlowForge.Application.Features.Labels.Assign;

public sealed record AssignLabelCommand : IRequest<ApiResponse<AssignLabelResponse>>
{
    public Guid WorkItemId { get; init; }

    public Guid LabelId { get; init; }
}