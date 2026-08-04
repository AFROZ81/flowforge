using FlowForge.Application.Common.Responses;
using MediatR;

namespace FlowForge.Application.Features.Labels.GetLabelById;

public sealed record GetLabelByIdQuery : IRequest<ApiResponse<GetLabelByIdResponse>>
{
    public Guid Id { get; init; }
}