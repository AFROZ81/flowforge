using FlowForge.Application.Common.Responses;
using MediatR;

namespace FlowForge.Application.Features.Comments.GetCommentById;

public sealed record GetCommentByIdQuery : IRequest<ApiResponse<GetCommentByIdResponse>>
{
    public Guid Id { get; init; }
}