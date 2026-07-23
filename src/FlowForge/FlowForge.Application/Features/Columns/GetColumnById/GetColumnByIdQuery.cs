using FlowForge.Application.Common.Responses;
using MediatR;

namespace FlowForge.Application.Features.Columns.GetById;

public sealed record GetColumnByIdQuery : IRequest<ApiResponse<GetColumnByIdResponse>>
{
    public Guid Id { get; init; }
}