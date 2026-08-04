using FlowForge.Application.Common.Responses;
using FlowForge.Application.Interfaces;
using FlowForge.Application.Services.Authentication;
using FlowForge.Application.Services.Notifications;
using FlowForge.Application.Services.WorkItemHistories;
using FlowForge.Application.Services.Realtime;
using FlowForge.Application.Common.Constants;
using FlowForge.Domain.Enums;

using FlowForge.Domain.Entities;
using MediatR;

namespace FlowForge.Application.Features.Comments.Create;

public sealed class CreateCommentCommandHandler : IRequestHandler<CreateCommentCommand, ApiResponse<CreateCommentResponse>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly CommentRules _commentRules;
    private readonly INotificationService _notificationService;
    private readonly IWorkItemHistoryService _historyService;
    private readonly IRealtimeNotifier _realtimeNotifier;

    public CreateCommentCommandHandler(IApplicationDbContext context, ICurrentUserService currentUser, CommentRules commentRules, INotificationService notificationService, IWorkItemHistoryService historyService, IRealtimeNotifier realtimeNotifier)
    {
        _context = context;
        _currentUser = currentUser;
        _commentRules = commentRules;
        _notificationService = notificationService;
        _historyService = historyService;
        _commentRules = commentRules;
        _realtimeNotifier = realtimeNotifier;
    }

    public async Task<ApiResponse<CreateCommentResponse>> Handle(CreateCommentCommand request, CancellationToken cancellationToken)
    {
        var currentUser = _currentUser.User;

        var workItem = await _commentRules.GetWorkItemAsync(request.WorkItemId, currentUser.OrganizationId, cancellationToken);

        _commentRules.EnsureWorkItemNotArchived(workItem);

        var comment = new Comment(request.WorkItemId, currentUser.UserId, request.Content);

        _context.Comments.Add(comment);
        
        Notification? notification = null;

        if (workItem.AssigneeId.HasValue && workItem.AssigneeId.Value != currentUser.UserId)
        {
            notification = await _notificationService.CreateAsync(currentUser.OrganizationId, workItem.AssigneeId.Value, NotificationType.CommentAdded, "New comment", $"A new comment was added to \"{workItem.Title}\".", workItem.Id, cancellationToken);
        }

        await _context.SaveChangesAsync(cancellationToken);

        if (notification is not null)
        {
            await _realtimeNotifier.NotifyUserAsync(
                notification.RecipientId,
                "NotificationReceived",
                new
                {
                    notification.Id,
                    notification.Title,
                    notification.Message,
                    notification.Type,
                    notification.CreatedAt,
                    notification.WorkItemId,
                    notification.IsRead
                },
                cancellationToken);
        }

        await _historyService.CreateAsync(
            workItem.Id,
            currentUser.UserId,
            WorkItemHistoryAction.CommentAdded,
            $"{currentUser.FullName} added a comment.",
            cancellationToken);

        await _realtimeNotifier.NotifyBoardAsync(
            workItem.Column.BoardId,
            RealtimeEvents.CommentAdded,
            new
            {
                BoardId = workItem.Column.BoardId,
                WorkItemId = workItem.Id,
                CommentId = comment.Id,
                AuthorId = comment.AuthorId,
                Content = comment.Content,
                CreatedAt = comment.CreatedAt,
                IsEdited = comment.IsEdited
            },
            cancellationToken);
            
        return ApiResponse<CreateCommentResponse>.SuccessResponse(
            new CreateCommentResponse
            {
                Id = comment.Id,
                WorkItemId = comment.WorkItemId,
                AuthorId = comment.AuthorId,
                Content = comment.Content,
                IsEdited = comment.IsEdited,
                CreatedAt = comment.CreatedAt
            },
            "Comment created successfully.");
    }
}