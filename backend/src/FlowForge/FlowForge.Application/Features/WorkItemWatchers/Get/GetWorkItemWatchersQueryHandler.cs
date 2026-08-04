using FlowForge.Application.Common.Responses;
using FlowForge.Application.Services.Authentication;
using FlowForge.Application.Services.Users;
using MediatR;

namespace FlowForge.Application.Features.WorkItemWatchers.Get;

public sealed class GetWorkItemWatchersQueryHandler : IRequestHandler<GetWorkItemWatchersQuery, ApiResponse<List<GetWorkItemWatcherResponse>>>
{
    private readonly WorkItemWatcherRules _rules;
    private readonly IUserService _userService;
    private readonly ICurrentUserService _currentUser;

    public GetWorkItemWatchersQueryHandler(WorkItemWatcherRules rules, IUserService userService, ICurrentUserService currentUser)
    {
        _rules = rules;
        _userService = userService;
        _currentUser = currentUser;
    }

    public async Task<ApiResponse<List<GetWorkItemWatcherResponse>>> Handle(GetWorkItemWatchersQuery request, CancellationToken cancellationToken)
    {
        var currentUser = _currentUser.User;

        await _rules.GetWorkItemAsync(request.WorkItemId, currentUser.OrganizationId, cancellationToken);

        var watchers = await _rules.GetWatchersAsync(request.WorkItemId, cancellationToken);

        var users = await _userService.GetDictionaryAsync(watchers.Select(x => x.UserId), cancellationToken);

        var response = watchers
            .Select(x => new GetWorkItemWatcherResponse
            {
                Id = x.Id,
                UserId = x.UserId,
                FullName = users[x.UserId].FullName,
                Email = users[x.UserId].Email,
                CreatedAt = x.CreatedAt
            })
            .OrderBy(x => x.FullName)
            .ToList();

        return ApiResponse<List<GetWorkItemWatcherResponse>>.SuccessResponse(response, "Watchers retrieved successfully.");
    }
}