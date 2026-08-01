using FlowForge.Application.Common.Responses;
using FlowForge.Application.Services.Authentication;
using MediatR;

namespace FlowForge.Application.Features.Checklists.Uncomplete;

public sealed class UncompleteChecklistItemCommandHandler : IRequestHandler<UncompleteChecklistItemCommand, ApiResponse<UncompleteChecklistItemResponse>>
{
    private readonly ChecklistRules _rules;
    private readonly ICurrentUserService _currentUser;

    public UncompleteChecklistItemCommandHandler(ChecklistRules rules, ICurrentUserService currentUser)
    {
        _rules = rules;
        _currentUser = currentUser;
    }

    public async Task<ApiResponse<UncompleteChecklistItemResponse>> Handle(UncompleteChecklistItemCommand request, CancellationToken cancellationToken)
    {
        var currentUser = _currentUser.User;

        var checklistItem = await _rules.GetChecklistItemAsync(request.ChecklistItemId, currentUser.OrganizationId,  cancellationToken);

        _rules.EnsureWorkItemNotArchived(checklistItem.WorkItem);

        checklistItem.Uncomplete();

        await _rules.SaveChangesAsync(cancellationToken);

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