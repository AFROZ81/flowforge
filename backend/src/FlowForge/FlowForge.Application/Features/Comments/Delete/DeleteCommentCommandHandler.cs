using FlowForge.Application.Common.Responses;
using FlowForge.Application.Interfaces;
using FlowForge.Application.Services.Authentication;
using FlowForge.Application.Common.Constants;
using FlowForge.Application.Services.Realtime;

using MediatR;

namespace FlowForge.Application.Features.Comments.Delete;

public sealed class DeleteCommentCommandHandler : IRequestHandler<DeleteCommentCommand, ApiResponse<DeleteCommentResponse>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly CommentRules _commentRules;
    private readonly IRealtimeNotifier _realtimeNotifier;

    public DeleteCommentCommandHandler(IApplicationDbContext context, ICurrentUserService currentUser,  CommentRules commentRules, IRealtimeNotifier realtimeNotifier)
    {
        _context = context;
        _currentUser = currentUser;
        _commentRules = commentRules;
        _realtimeNotifier = realtimeNotifier;
    }

    public async Task<ApiResponse<DeleteCommentResponse>> Handle(DeleteCommentCommand request, CancellationToken cancellationToken)
    {
        var currentUser = _currentUser.User;

        var comment = await _commentRules.GetByIdAsync(request.CommentId, currentUser.OrganizationId, cancellationToken);

        _commentRules.EnsureAuthor(comment, currentUser.UserId);

        _commentRules.EnsureWorkItemNotArchived(comment.WorkItem);

        comment.Delete();

        await _context.SaveChangesAsync(cancellationToken);

        await _realtimeNotifier.NotifyBoardAsync(
            comment.WorkItem.Column.BoardId,
            RealtimeEvents.CommentDeleted,
            new
            {
                BoardId = comment.WorkItem.Column.BoardId,
                WorkItemId = comment.WorkItemId,
                CommentId = comment.Id
            },
            cancellationToken);

        return ApiResponse<DeleteCommentResponse>.SuccessResponse(
            new DeleteCommentResponse
            {
                Id = comment.Id,
                WorkItemId = comment.WorkItemId,
                IsDeleted = comment.IsDeleted,
                DeletedAt = comment.DeletedAt
            },
            "Comment deleted successfully.");
    }
}