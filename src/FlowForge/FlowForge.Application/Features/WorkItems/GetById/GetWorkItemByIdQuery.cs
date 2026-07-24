using FlowForge.Application.Common.Responses;
using MediatR;

namespace FlowForge.Application.Features.WorkItems.GetById;

public sealed record GetWorkItemByIdQuery : IRequest<ApiResponse<GetWorkItemByIdResponse>>
{
    public Guid Id { get; init; }
}