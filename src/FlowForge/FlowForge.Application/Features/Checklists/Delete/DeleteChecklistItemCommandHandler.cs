using FlowForge.Application.Common.Responses;
using FlowForge.Application.Services.Authentication;
using MediatR;

namespace FlowForge.Application.Features.Checklists.Delete;

public sealed class DeleteChecklistItemCommandHandler : IRequestHandler<DeleteChecklistItemCommand, ApiResponse<DeleteChecklistItemResponse>>
{
    private readonly ChecklistRules _rules;
    private readonly ICurrentUserService _currentUser;

    public DeleteChecklistItemCommandHandler(ChecklistRules rules, ICurrentUserService currentUser)
    {
        _rules = rules;
        _currentUser = currentUser;
    }

    public async Task<ApiResponse<DeleteChecklistItemResponse>> Handle(DeleteChecklistItemCommand request, CancellationToken cancellationToken)
    {
        var currentUser = _currentUser.User;

        var checklistItem = await _rules.GetChecklistItemAsync(request.ChecklistItemId, currentUser.OrganizationId, cancellationToken);

        _rules.EnsureWorkItemNotArchived(checklistItem.WorkItem);

        checklistItem.Delete();

        await _rules.SaveChangesAsync(cancellationToken);

        return ApiResponse<DeleteChecklistItemResponse>
            .SuccessResponse(
                new DeleteChecklistItemResponse
                {
                    Id = checklistItem.Id
                },
                "Checklist item deleted successfully.");
    }
}