using FlowForge.Application.Common.Responses;
using MediatR;

namespace FlowForge.Application.Features.Checklists.Get;

public sealed record GetChecklistQuery : IRequest<ApiResponse<List<GetChecklistResponse>>>
{
    public Guid WorkItemId { get; init; }
}