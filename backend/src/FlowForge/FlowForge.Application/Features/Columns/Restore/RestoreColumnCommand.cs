using FlowForge.Application.Common.Responses;
using MediatR;

namespace FlowForge.Application.Features.Columns.Restore;

public sealed record RestoreColumnCommand : IRequest<ApiResponse<RestoreColumnResponse>>
{
    public Guid Id { get; init; }
}