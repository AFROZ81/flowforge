using FlowForge.Application.Common.Responses;
using MediatR;

namespace FlowForge.Application.Features.Comments.Update;

public sealed record UpdateCommentCommand : IRequest<ApiResponse<UpdateCommentResponse>>
{
    public Guid CommentId { get; init; }

    public string Content { get; init; } = string.Empty;
}