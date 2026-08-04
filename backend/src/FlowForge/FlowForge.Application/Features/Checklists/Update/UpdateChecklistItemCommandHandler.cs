using FlowForge.Application.Common.Responses;
using FlowForge.Application.Services.Authentication;
using MediatR;

namespace FlowForge.Application.Features.Checklists.Update;

public sealed class UpdateChecklistItemCommandHandler : IRequestHandler<UpdateChecklistItemCommand, ApiResponse<UpdateChecklistItemResponse>>
{
    private readonly ChecklistRules _rules;
    private readonly ICurrentUserService _currentUser;

    public UpdateChecklistItemCommandHandler(ChecklistRules rules, ICurrentUserService currentUser)
    {
        _rules = rules;
        _currentUser = currentUser;
    }

    public async Task<ApiResponse<UpdateChecklistItemResponse>> Handle(UpdateChecklistItemCommand request, CancellationToken cancellationToken)
    {
        var currentUser = _currentUser.User;

        var checklistItem = await _rules.GetChecklistItemAsync(request.ChecklistItemId, currentUser.OrganizationId, cancellationToken);

        _rules.EnsureWorkItemNotArchived(checklistItem.WorkItem);

        checklistItem.Rename(request.Title);

        await _rules.SaveChangesAsync(cancellationToken);

        return ApiResponse<UpdateChecklistItemResponse>
            .SuccessResponse(
                new UpdateChecklistItemResponse
                {
                    Id = checklistItem.Id,
                    Title = checklistItem.Title
                },
                "Checklist item updated successfully.");
    }
}