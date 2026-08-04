using FlowForge.Application.Common.Responses;
using FlowForge.Application.Services.Authentication;
using FlowForge.Application.Services.WorkItemHistories;
using FlowForge.Domain.Enums;
using MediatR;

namespace FlowForge.Application.Features.Reminders.Set;

public sealed class SetReminderCommandHandler : IRequestHandler<SetReminderCommand, ApiResponse<SetReminderResponse>>
{
    private readonly ReminderRules _rules;
    private readonly ICurrentUserService _currentUser;
    private readonly IWorkItemHistoryService _historyService;

    public SetReminderCommandHandler(ReminderRules rules, ICurrentUserService currentUser, IWorkItemHistoryService historyService)
    {
        _rules = rules;
        _currentUser = currentUser;
        _historyService = historyService;
    }

    public async Task<ApiResponse<SetReminderResponse>> Handle(SetReminderCommand request, CancellationToken cancellationToken)
    {
        var currentUser = _currentUser.User;

        var workItem = await _rules.GetWorkItemAsync(request.WorkItemId, currentUser.OrganizationId, cancellationToken);

        _rules.EnsureWorkItemNotArchived(workItem);

        _rules.ValidateReminder(request.DueDate, request.ReminderDate);

        workItem.SetReminder(request.DueDate, request.ReminderDate);

        await _rules.SaveChangesAsync(cancellationToken);

        await _historyService.CreateAsync(
            workItem.Id,
            currentUser.UserId,
            WorkItemHistoryAction.ReminderUpdated,
            $"{currentUser.FullName} updated the reminder.",
            cancellationToken);

        return ApiResponse<SetReminderResponse>.SuccessResponse(
            new SetReminderResponse
            {
                WorkItemId = workItem.Id,
                DueDate = workItem.DueDate,
                ReminderDate = workItem.ReminderDate
            },
            "Reminder updated successfully.");
    }
}