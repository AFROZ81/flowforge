using FlowForge.Application.Common.Responses;
using FlowForge.Application.Interfaces;
using FlowForge.Application.Services.Authentication;
using FlowForge.Application.Services.Notifications;
using FlowForge.Application.Services.Realtime;
using FlowForge.Domain.Enums;
using FlowForge.Domain.Entities;
using MediatR;

namespace FlowForge.Application.Features.WorkItems.Block;

public sealed class BlockWorkItemCommandHandler
    : IRequestHandler<BlockWorkItemCommand, ApiResponse<BlockWorkItemResponse>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly WorkItemRules _rules;
    private readonly INotificationService _notificationService;
    private readonly IRealtimeNotifier _realtimeNotifier;

    public BlockWorkItemCommandHandler(
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

    public async Task<ApiResponse<BlockWorkItemResponse>> Handle(
        BlockWorkItemCommand request,
        CancellationToken cancellationToken)
    {
        var currentUser = _currentUser.User;

        var workItem = await _rules.GetByIdAsync(
            request.WorkItemId,
            currentUser.OrganizationId,
            cancellationToken);

        _rules.EnsureNotArchived(workItem);

        var previousStatus = workItem.Status;

        workItem.MarkBlocked();
        
        Notification? notification = null;

        if (previousStatus != workItem.Status &&
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

        return ApiResponse<BlockWorkItemResponse>.SuccessResponse(
            new BlockWorkItemResponse
            {
                Id = workItem.Id,
                Status = workItem.Status
            },
            "Work Item blocked successfully.");
    }
}