using FlowForge.Application.Common.Responses;
using FlowForge.Application.Services.Authentication;
using FlowForge.Application.Services.WorkItemHistories;
using FlowForge.Domain.Enums;
using MediatR;

namespace FlowForge.Application.Features.Checklists.Complete;

public sealed class CompleteChecklistItemCommandHandler : IRequestHandler<CompleteChecklistItemCommand, ApiResponse<CompleteChecklistItemResponse>>
{
    private readonly ChecklistRules _rules;
    private readonly ICurrentUserService _currentUser;
    private readonly IWorkItemHistoryService _historyService;

    public CompleteChecklistItemCommandHandler(ChecklistRules rules, ICurrentUserService currentUser, IWorkItemHistoryService historyService)
    {
        _rules = rules;
        _currentUser = currentUser;
        _historyService = historyService;
    }

    public async Task<ApiResponse<CompleteChecklistItemResponse>> Handle(CompleteChecklistItemCommand request, CancellationToken cancellationToken)
    {
        var currentUser = _currentUser.User;

        var checklistItem = await _rules.GetChecklistItemAsync(request.ChecklistItemId, currentUser.OrganizationId, cancellationToken);

        _rules.EnsureWorkItemNotArchived(checklistItem.WorkItem);

        checklistItem.Complete(currentUser.UserId);

        await _rules.SaveChangesAsync(cancellationToken);

        await _historyService.CreateAsync(
            checklistItem.WorkItemId,
            currentUser.UserId,
            WorkItemHistoryAction.ChecklistCompleted,
            $"{currentUser.FullName} completed checklist item \"{checklistItem.Title}\".",
            cancellationToken);

        return ApiResponse<CompleteChecklistItemResponse>
            .SuccessResponse(
                new CompleteChecklistItemResponse
                {
                    Id = checklistItem.Id,
                    IsCompleted = checklistItem.IsCompleted,
                    CompletedAt = checklistItem.CompletedAt,
                    CompletedBy = checklistItem.CompletedBy
                },
                "Checklist item completed successfully.");
    }
}