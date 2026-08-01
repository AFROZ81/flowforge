using FlowForge.Application.Common.Responses;
using FlowForge.Application.Services.Authentication;
using MediatR;

namespace FlowForge.Application.Features.Checklists.Progress;

public sealed class GetChecklistProgressQueryHandler : IRequestHandler<GetChecklistProgressQuery, ApiResponse<GetChecklistProgressResponse>>
{
    private readonly ChecklistRules _rules;
    private readonly ICurrentUserService _currentUser;
 
    public GetChecklistProgressQueryHandler(ChecklistRules rules, ICurrentUserService currentUser)
    {
        _rules = rules;
        _currentUser = currentUser;
    }

    public async Task<ApiResponse<GetChecklistProgressResponse>> Handle(GetChecklistProgressQuery request, CancellationToken cancellationToken)
    {
        var currentUser = _currentUser.User;

        await _rules.GetWorkItemAsync(request.WorkItemId, currentUser.OrganizationId, cancellationToken);

        var progress = await _rules.GetProgressAsync(request.WorkItemId, cancellationToken);

        return ApiResponse<GetChecklistProgressResponse>.SuccessResponse(progress, "Checklist progress retrieved successfully.");
    }
}