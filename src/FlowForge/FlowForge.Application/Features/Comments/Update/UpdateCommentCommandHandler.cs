using FlowForge.Application.Common.Responses;
using FlowForge.Application.Interfaces;
using FlowForge.Application.Services.Authentication;
using MediatR;

namespace FlowForge.Application.Features.Comments.Update;

public sealed class UpdateCommentCommandHandler : IRequestHandler<UpdateCommentCommand, ApiResponse<UpdateCommentResponse>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly CommentRules _commentRules;

    public UpdateCommentCommandHandler(IApplicationDbContext context, ICurrentUserService currentUser, CommentRules commentRules)
    {
        _context = context;
        _currentUser = currentUser;
        _commentRules = commentRules;
    }

    public async Task<ApiResponse<UpdateCommentResponse>> Handle(UpdateCommentCommand request, CancellationToken cancellationToken)
    {
        var currentUser = _currentUser.User;

        var comment = await _commentRules.GetByIdAsync(request.CommentId, currentUser.OrganizationId, cancellationToken);

        _commentRules.EnsureAuthor(comment, currentUser.UserId);

        _commentRules.EnsureWorkItemNotArchived(comment.WorkItem);

        comment.Edit(request.Content);

        await _context.SaveChangesAsync(cancellationToken);

        return ApiResponse<UpdateCommentResponse>.SuccessResponse(
            new UpdateCommentResponse
            {
                Id = comment.Id,
                WorkItemId = comment.WorkItemId,
                AuthorId = comment.AuthorId,
                Content = comment.Content,
                IsEdited = comment.IsEdited,
                EditedAt = comment.EditedAt,
                UpdatedAt = comment.UpdatedAt
            },
            "Comment updated successfully.");
    }
}