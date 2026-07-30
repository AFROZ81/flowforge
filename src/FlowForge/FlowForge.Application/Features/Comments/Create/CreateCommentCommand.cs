using FlowForge.Application.Common.Responses;
using MediatR;

namespace FlowForge.Application.Features.Comments.Create;

public sealed record CreateCommentCommand : IRequest<ApiResponse<CreateCommentResponse>>
{
    public Guid WorkItemId { get; init; }

    public string Content { get; init; } = string.Empty;
}