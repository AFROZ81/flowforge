using FlowForge.Application.Common.Responses;
using MediatR;

namespace FlowForge.Application.Features.WorkItems.Archive;

public sealed record ArchiveWorkItemCommand : IRequest<ApiResponse<ArchiveWorkItemResponse>>
{
    public Guid WorkItemId { get; init; }
}