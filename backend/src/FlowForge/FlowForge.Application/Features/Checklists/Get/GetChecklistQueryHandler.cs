using FlowForge.Application.Common.Responses;
using FlowForge.Application.Services.Authentication;
using MediatR;

namespace FlowForge.Application.Features.Checklists.Get;

public sealed class GetChecklistQueryHandler : IRequestHandler<GetChecklistQuery, ApiResponse<List<GetChecklistResponse>>>
{
    private readonly ChecklistRules _rules;
    private readonly ICurrentUserService _currentUser;

    public GetChecklistQueryHandler(ChecklistRules rules, ICurrentUserService currentUser)
    {
        _rules = rules;
        _currentUser = currentUser;
    }

    public async Task<ApiResponse<List<GetChecklistResponse>>> Handle(GetChecklistQuery request, CancellationToken cancellationToken)
    {
        var currentUser = _currentUser.User;

        await _rules.GetWorkItemAsync(request.WorkItemId, currentUser.OrganizationId, cancellationToken);

        var checklist = await _rules.GetChecklistAsync(request.WorkItemId, cancellationToken);

        var response = checklist
            .Select(x => new GetChecklistResponse
            {
                Id = x.Id,
                Title = x.Title,
                Order = x.Order,
                IsCompleted = x.IsCompleted,
                CompletedAt = x.CompletedAt,
                CompletedBy = x.CompletedBy
            })
            .ToList();

        return ApiResponse<List<GetChecklistResponse>>.SuccessResponse(response, "Checklist retrieved successfully.");
    }
}