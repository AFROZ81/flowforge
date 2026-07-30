using FlowForge.Application.Common.Responses;
using FlowForge.Application.Services.Authentication;
using MediatR;

namespace FlowForge.Application.Features.Comments.GetCommentById;

public sealed class GetCommentByIdQueryHandler : IRequestHandler<GetCommentByIdQuery, ApiResponse<GetCommentByIdResponse>>
{
    private readonly ICurrentUserService _currentUser;
    private readonly CommentRules _commentRules;

    public GetCommentByIdQueryHandler(ICurrentUserService currentUser, CommentRules commentRules)
    {
        _currentUser = currentUser;
        _commentRules = commentRules;
    }

    public async Task<ApiResponse<GetCommentByIdResponse>> Handle(GetCommentByIdQuery request, CancellationToken cancellationToken)
    {
        var currentUser = _currentUser.User;

        var comment = await _commentRules.GetByIdAsync(request.Id, currentUser.OrganizationId, cancellationToken);

        return ApiResponse<GetCommentByIdResponse>.SuccessResponse(
            new GetCommentByIdResponse
            {
                Id = comment.Id,
                WorkItemId = comment.WorkItemId,
                AuthorId = comment.AuthorId,
                Content = comment.Content
            },
            "Comment retrieved successfully.");
    }
}