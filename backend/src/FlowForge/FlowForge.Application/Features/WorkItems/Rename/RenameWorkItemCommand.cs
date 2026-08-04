using FlowForge.Application.Common.Responses;
using MediatR;

namespace FlowForge.Application.Features.WorkItems.Rename;

public sealed record RenameWorkItemCommand : IRequest<ApiResponse<RenameWorkItemResponse>>
{
    public Guid WorkItemId { get; init; }

    public string Title { get; init; } = string.Empty;
}