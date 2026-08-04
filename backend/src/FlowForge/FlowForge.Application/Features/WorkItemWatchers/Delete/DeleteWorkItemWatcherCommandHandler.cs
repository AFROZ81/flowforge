using FlowForge.Application.Common.Responses;
using FlowForge.Application.Services.Authentication;
using FlowForge.Application.Services.WorkItemHistories;
using FlowForge.Domain.Enums;
using MediatR;

namespace FlowForge.Application.Features.WorkItemWatchers.Delete;

public sealed class DeleteWorkItemWatcherCommandHandler : IRequestHandler<DeleteWorkItemWatcherCommand, ApiResponse<DeleteWorkItemWatcherResponse>>
{
    private readonly WorkItemWatcherRules _rules;
    private readonly ICurrentUserService _currentUser;
    private readonly IWorkItemHistoryService _historyService;

    public DeleteWorkItemWatcherCommandHandler(WorkItemWatcherRules rules, ICurrentUserService currentUser, IWorkItemHistoryService historyService)
    {
        _rules = rules;
        _currentUser = currentUser;
        _historyService = historyService;
    }

    public async Task<ApiResponse<DeleteWorkItemWatcherResponse>> Handle(DeleteWorkItemWatcherCommand request, CancellationToken cancellationToken)
    {
        var currentUser = _currentUser.User;

        var watcher = await _rules.GetByIdAsync(request.WatcherId, currentUser.OrganizationId, cancellationToken);

        _rules.EnsureWorkItemNotArchived(watcher.WorkItem);

        watcher.Delete();

        await _rules.SaveChangesAsync(cancellationToken);

        await _historyService.CreateAsync(
            watcher.WorkItemId,
            currentUser.UserId,
            WorkItemHistoryAction.WatcherRemoved,
            $"{currentUser.FullName} removed a watcher.",
            cancellationToken);

        return ApiResponse<DeleteWorkItemWatcherResponse>
            .SuccessResponse(
                new DeleteWorkItemWatcherResponse
                {
                    Id = watcher.Id
                },
                "Watcher removed successfully.");
    }
}