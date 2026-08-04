using FlowForge.Application.Common.Responses;
using MediatR;

namespace FlowForge.Application.Features.Columns.GetColumns;

public sealed record GetColumnsQuery : IRequest<ApiResponse<List<GetColumnsResponse>>>
{
    public Guid BoardId { get; init; }
}