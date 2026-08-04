using FlowForge.Application.Common.Responses;
using FlowForge.Application.Interfaces;
using FlowForge.Application.Services.Authentication;
using FlowForge.Domain.Entities;
using FlowForge.Application.Common.Exceptions;
using FlowForge.Application.Services.Notifications;
using FlowForge.Application.Services.WorkItemHistories;
using FlowForge.Application.Services.Realtime;
using FlowForge.Domain.Enums;
using MediatR;

namespace FlowForge.Application.Features.Labels.Assign;

public sealed class AssignLabelCommandHandler : IRequestHandler<AssignLabelCommand, ApiResponse<AssignLabelResponse>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly LabelRules _labelRules;
    private readonly INotificationService _notificationService;
    private readonly IWorkItemHistoryService _historyService;
    private readonly IRealtimeNotifier _realtimeNotifier;

    public AssignLabelCommandHandler(IApplicationDbContext context, ICurrentUserService currentUser, LabelRules labelRules, INotificationService notificationService, IWorkItemHistoryService historyService, IRealtimeNotifier realtimeNotifier)
    {
        _context = context;
        _currentUser = currentUser;
        _labelRules = labelRules;
        _notificationService = notificationService;
        _historyService = historyService;
        _labelRules = labelRules;
        _realtimeNotifier = realtimeNotifier;
    }

    public async Task<ApiResponse<AssignLabelResponse>> Handle(AssignLabelCommand request, CancellationToken cancellationToken)
    {
        var currentUser = _currentUser.User;

        var workItem = await _labelRules.GetWorkItemAsync(request.WorkItemId, currentUser.OrganizationId, cancellationToken);

        _labelRules.EnsureWorkItemNotArchived(workItem);

        var label = await _labelRules.GetByIdAsync(request.LabelId, currentUser.OrganizationId, cancellationToken);

        var workItemLabel = await _labelRules.GetAssignmentAsync(workItem.Id, label.Id, cancellationToken);

        if (workItemLabel is not null)
        {
            if (!workItemLabel.IsDeleted)
                throw new BadRequestException("This label is already assigned to the Work Item.");

            workItemLabel.Restore();
        }
        else
        {
            workItemLabel = new WorkItemLabel(workItem.Id, label.Id);

            _context.WorkItemLabels.Add(workItemLabel);
        }

        Notification? notification = null;

        if (workItem.AssigneeId.HasValue && workItem.AssigneeId.Value != currentUser.UserId)
        {
            notification = await _notificationService.CreateAsync(
                currentUser.OrganizationId,
                workItem.AssigneeId.Value,
                NotificationType.LabelAssigned,
                "Label assigned",
                $"The label \"{label.Name}\" was added to \"{workItem.Title}\".",
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

        await _historyService.CreateAsync(
            workItem.Id,
            currentUser.UserId,
            WorkItemHistoryAction.LabelAdded,
            $"{currentUser.FullName} added label \"{label.Name}\".",
            cancellationToken);

        return ApiResponse<AssignLabelResponse>.SuccessResponse(
            new AssignLabelResponse
            {
                Id = workItemLabel.Id,
                WorkItemId = workItemLabel.WorkItemId,
                LabelId = workItemLabel.LabelId,
                LabelName = label.Name,
                Color = label.Color,
                CreatedAt = workItemLabel.CreatedAt
            },
            "Label assigned successfully.");
    }
}