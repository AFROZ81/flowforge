using FlowForge.Application.Common.Responses;
using MediatR;

namespace FlowForge.Application.Features.Comments.Delete;

public sealed record DeleteCommentCommand : IRequest<ApiResponse<DeleteCommentResponse>>
{
    public Guid CommentId { get; init; }
}