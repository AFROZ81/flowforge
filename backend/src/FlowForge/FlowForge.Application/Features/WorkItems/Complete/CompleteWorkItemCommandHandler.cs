using FlowForge.Application.Common.Constants;
using FlowForge.Application.Common.Responses;
using FlowForge.Application.Interfaces;
using FlowForge.Application.Services.Authentication;
using FlowForge.Application.Services.Notifications;
using FlowForge.Application.Services.Realtime;
using FlowForge.Domain.Entities;
using FlowForge.Domain.Enums;
using FlowForge.Domain.Common.Enums;

using MediatR;

using Microsoft.EntityFrameworkCore;

namespace FlowForge.Application.Features.WorkItems.Complete;

public sealed class CompleteWorkItemCommandHandler
    : IRequestHandler<
        CompleteWorkItemCommand,
        ApiResponse<CompleteWorkItemResponse>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly WorkItemRules _rules;
    private readonly INotificationService _notificationService;
    private readonly IRealtimeNotifier _realtimeNotifier;

    public CompleteWorkItemCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser,
        WorkItemRules rules,
        INotificationService notificationService,
        IRealtimeNotifier realtimeNotifier)
    {
        _context = context;
        _currentUser = currentUser;
        _rules = rules;
        _notificationService = notificationService;
        _realtimeNotifier = realtimeNotifier;
    }

    public async Task<ApiResponse<CompleteWorkItemResponse>> Handle(
        CompleteWorkItemCommand request,
        CancellationToken cancellationToken)
    {
        var currentUser = _currentUser.User;

        // ---------------------------------------------------------
        // 1. Load work item
        // ---------------------------------------------------------

        var workItem = await _rules.GetByIdAsync(
            request.WorkItemId,
            currentUser.OrganizationId,
            cancellationToken);

        _rules.EnsureNotArchived(workItem);

        // ---------------------------------------------------------
        // 2. Capture previous status
        // ---------------------------------------------------------

        var previousStatus = workItem.Status;

        // ---------------------------------------------------------
        // 3. Complete the work item
        // ---------------------------------------------------------

        workItem.MarkCompleted();

        var statusChanged =
            previousStatus != workItem.Status;

        // ---------------------------------------------------------
        // 4. Create completion history
        //
        // Only create this when the status actually changes.
        //
        // This prevents duplicate "Completed" history records
        // when the complete endpoint is called again.
        // ---------------------------------------------------------

        if (statusChanged &&
            workItem.Status == WorkItemStatus.Completed)
        {
            var history = new WorkItemHistory(
                workItem.Id,
                currentUser.UserId,
                WorkItemHistoryAction.Completed,
                $"Work Item status changed from {previousStatus} to {workItem.Status}.");

            _context.WorkItemHistories.Add(history);
        }

        // ---------------------------------------------------------
        // 5. Create notification for another assignee
        // ---------------------------------------------------------

        Notification? notification = null;

        if (statusChanged &&
            workItem.AssigneeId.HasValue &&
            workItem.AssigneeId.Value != currentUser.UserId)
        {
            notification = await _notificationService.CreateAsync(
                currentUser.OrganizationId,
                workItem.AssigneeId.Value,
                NotificationType.WorkItemStatusChanged,
                "Work Item status changed",
                $"\"{workItem.Title}\" changed from {previousStatus} to {workItem.Status}.",
                workItem.Id,
                cancellationToken);
        }

        // ---------------------------------------------------------
        // 6. Save work item + history + notification
        // ---------------------------------------------------------

        await _context.SaveChangesAsync(
            cancellationToken);

        // ---------------------------------------------------------
        // 7. Notify recipient
        // ---------------------------------------------------------

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

        // ---------------------------------------------------------
        // 8. Resolve board
        // ---------------------------------------------------------

        var boardId = await _context.WorkItems
            .Where(w => w.Id == workItem.Id)
            .Select(w => w.Column.BoardId)
            .SingleAsync(cancellationToken);

        // ---------------------------------------------------------
        // 9. Notify board
        // ---------------------------------------------------------

        await _realtimeNotifier.NotifyBoardAsync(
            boardId,
            RealtimeEvents.WorkItemUpdated,
            new
            {
                BoardId = boardId,
                WorkItemId = workItem.Id,
                Status = workItem.Status
            },
            cancellationToken);

        // ---------------------------------------------------------
        // 10. Return response
        // ---------------------------------------------------------

        return ApiResponse<CompleteWorkItemResponse>.SuccessResponse(
            new CompleteWorkItemResponse
            {
                Id = workItem.Id,
                Status = workItem.Status
            },
            "Work Item marked as completed successfully.");
    }
}