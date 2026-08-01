using FlowForge.Application.Common.Responses;
using FlowForge.Application.Services.Authentication;
using MediatR;

namespace FlowForge.Application.Features.WorkItemHistories.Get;

public sealed class GetWorkItemHistoryQueryHandler : IRequestHandler<GetWorkItemHistoryQuery, ApiResponse<List<GetWorkItemHistoryResponse>>>
{
    private readonly WorkItemHistoryRules _rules;
    private readonly ICurrentUserService _currentUser;

    public GetWorkItemHistoryQueryHandler(WorkItemHistoryRules rules, ICurrentUserService currentUser)
    {
        _rules = rules;
        _currentUser = currentUser;
    }

    public async Task<ApiResponse<List<GetWorkItemHistoryResponse>>>
        Handle(
            GetWorkItemHistoryQuery request,
            CancellationToken cancellationToken)
    {
        var currentUser = _currentUser.User;

        await _rules.GetWorkItemAsync(
            request.WorkItemId,
            currentUser.OrganizationId,
            cancellationToken);

        var history = await _rules.GetHistoryAsync(request.WorkItemId, cancellationToken);

        var response = history
            .Select(x => new GetWorkItemHistoryResponse
            {
                Id = x.Id,
                UserId = x.UserId,
                Action = x.Action,
                Description = x.Description,
                CreatedAt = x.CreatedAt
            })
            .ToList();

        return ApiResponse<List<GetWorkItemHistoryResponse>>.SuccessResponse(response, "History retrieved successfully.");
    }
}