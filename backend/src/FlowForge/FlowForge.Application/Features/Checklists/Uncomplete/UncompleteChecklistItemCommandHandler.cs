using FlowForge.Application.Common.Responses;
using FlowForge.Application.Services.Authentication;
using FlowForge.Application.Services.WorkItemHistories;
using FlowForge.Domain.Enums;
using MediatR;

namespace FlowForge.Application.Features.Checklists.Uncomplete;

public sealed class UncompleteChecklistItemCommandHandler : IRequestHandler<UncompleteChecklistItemCommand, ApiResponse<UncompleteChecklistItemResponse>>
{
    private readonly ChecklistRules _rules;
    private readonly ICurrentUserService _currentUser;
    private readonly IWorkItemHistoryService _historyService;

    public UncompleteChecklistItemCommandHandler(ChecklistRules rules, ICurrentUserService currentUser, IWorkItemHistoryService historyService)
    {
        _rules = rules;
        _currentUser = currentUser;
        _historyService = historyService;
    }

    public async Task<ApiResponse<UncompleteChecklistItemResponse>> Handle(UncompleteChecklistItemCommand request, CancellationToken cancellationToken)
    {
        var currentUser = _currentUser.User;

        var checklistItem = await _rules.GetChecklistItemAsync(request.ChecklistItemId, currentUser.OrganizationId,  cancellationToken);

        _rules.EnsureWorkItemNotArchived(checklistItem.WorkItem);

        checklistItem.Uncomplete();

        await _rules.SaveChangesAsync(cancellationToken);

        await _historyService.CreateAsync(
            checklistItem.WorkItemId,
            currentUser.UserId,
            WorkItemHistoryAction.ChecklistUncompleted,
            $"{currentUser.FullName} marked checklist item \"{checklistItem.Title}\" as incomplete.",
            cancellationToken);

        return ApiResponse<UncompleteChecklistItemResponse>
            .SuccessResponse(
                new UncompleteChecklistItemResponse
                {
                    Id = checklistItem.Id,
                    IsCompleted = checklistItem.IsCompleted
                },
                "Checklist item marked as incomplete successfully.");
    }
}