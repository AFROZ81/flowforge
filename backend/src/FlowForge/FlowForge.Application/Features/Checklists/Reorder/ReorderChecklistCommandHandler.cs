using FlowForge.Application.Common.Responses;
using FlowForge.Application.Services.Authentication;
using MediatR;

namespace FlowForge.Application.Features.Checklists.Reorder;

public sealed class ReorderChecklistCommandHandler : IRequestHandler<ReorderChecklistCommand, ApiResponse<ReorderChecklistResponse>>
{
    private readonly ChecklistRules _rules;
    private readonly ICurrentUserService _currentUser;

    public ReorderChecklistCommandHandler(ChecklistRules rules, ICurrentUserService currentUser)
    {
        _rules = rules;
        _currentUser = currentUser;
    }

    public async Task<ApiResponse<ReorderChecklistResponse>> Handle(ReorderChecklistCommand request, CancellationToken cancellationToken)
    {
        var currentUser = _currentUser.User;

        var updated = 0;

        foreach (var item in request.Items)
        {
            var checklistItem = await _rules.GetChecklistItemAsync(item.ChecklistItemId, currentUser.OrganizationId, cancellationToken);

            _rules.EnsureWorkItemNotArchived(checklistItem.WorkItem);

            checklistItem.Reorder(item.Order);

            updated++;
        }

        await _rules.SaveChangesAsync(cancellationToken);

        return ApiResponse<ReorderChecklistResponse>
            .SuccessResponse(
                new ReorderChecklistResponse
                {
                    UpdatedCount = updated
                },
                "Checklist reordered successfully.");
    }
}