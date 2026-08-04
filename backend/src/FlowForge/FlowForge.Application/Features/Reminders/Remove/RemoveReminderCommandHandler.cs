using FlowForge.Application.Common.Responses;
using FlowForge.Application.Services.Authentication;
using FlowForge.Application.Services.WorkItemHistories;
using FlowForge.Domain.Enums;
using MediatR;

namespace FlowForge.Application.Features.Reminders.Remove;

public sealed class RemoveReminderCommandHandler : IRequestHandler<RemoveReminderCommand, ApiResponse<RemoveReminderResponse>>
{
    private readonly ReminderRules _rules;
    private readonly ICurrentUserService _currentUser;
    private readonly IWorkItemHistoryService _historyService;

    public RemoveReminderCommandHandler(ReminderRules rules, ICurrentUserService currentUser, IWorkItemHistoryService historyService)
    {
        _rules = rules;
        _currentUser = currentUser;
        _historyService = historyService;
    }

    public async Task<ApiResponse<RemoveReminderResponse>> Handle(RemoveReminderCommand request, CancellationToken cancellationToken)
    {
        var currentUser = _currentUser.User;

        var workItem = await _rules.GetWorkItemAsync(request.WorkItemId, currentUser.OrganizationId, cancellationToken);

        _rules.EnsureWorkItemNotArchived(workItem);

        workItem.ClearReminder();

        await _rules.SaveChangesAsync(cancellationToken);

        await _historyService.CreateAsync(
            workItem.Id,
            currentUser.UserId,
            WorkItemHistoryAction.ReminderRemoved,
            $"{currentUser.FullName} removed the reminder.",
            cancellationToken);

        return ApiResponse<RemoveReminderResponse>
            .SuccessResponse(
                new RemoveReminderResponse
                {
                    WorkItemId = workItem.Id
                },
                "Reminder removed successfully.");
    }
}