using FlowForge.Application.Common.Responses;
using FlowForge.Application.Interfaces;
using FlowForge.Application.Services.Authentication;
using FlowForge.Application.Services.Notifications;
using FlowForge.Domain.Enums;
using MediatR;

namespace FlowForge.Application.Features.WorkItems.Activate;

public sealed class ActivateWorkItemCommandHandler
    : IRequestHandler<ActivateWorkItemCommand, ApiResponse<ActivateWorkItemResponse>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly WorkItemRules _rules;
    private readonly INotificationService _notificationService;

    public ActivateWorkItemCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser,
        WorkItemRules rules,
        INotificationService notificationService)
    {
        _context = context;
        _currentUser = currentUser;
        _rules = rules;
        _notificationService = notificationService;
    }

    public async Task<ApiResponse<ActivateWorkItemResponse>> Handle(
        ActivateWorkItemCommand request,
        CancellationToken cancellationToken)
    {
        var currentUser = _currentUser.User;

        var workItem = await _rules.GetByIdAsync(
            request.WorkItemId,
            currentUser.OrganizationId,
            cancellationToken);

        _rules.EnsureNotArchived(workItem);

        var previousStatus = workItem.Status;

        workItem.Activate();

        if (previousStatus != workItem.Status &&
            workItem.AssigneeId.HasValue &&
            workItem.AssigneeId.Value != currentUser.UserId)
        {
            await _notificationService.CreateAsync(
                currentUser.OrganizationId,
                workItem.AssigneeId.Value,
                NotificationType.WorkItemStatusChanged,
                "Work Item status changed",
                $"\"{workItem.Title}\" changed from {previousStatus} to {workItem.Status}.",
                workItem.Id,
                cancellationToken);
        }

        await _context.SaveChangesAsync(cancellationToken);

        return ApiResponse<ActivateWorkItemResponse>.SuccessResponse(
            new ActivateWorkItemResponse
            {
                Id = workItem.Id,
                Status = workItem.Status
            },
            "Work Item activated successfully.");
    }
}