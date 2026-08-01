using FlowForge.Application.Common.Responses;
using MediatR;

namespace FlowForge.Application.Features.Checklists.Progress;

public sealed record GetChecklistProgressQuery : IRequest<ApiResponse<GetChecklistProgressResponse>>
{
    public Guid WorkItemId { get; init; }
}