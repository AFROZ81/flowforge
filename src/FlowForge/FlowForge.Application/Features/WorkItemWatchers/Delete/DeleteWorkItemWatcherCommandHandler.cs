using FlowForge.Application.Common.Responses;
using FlowForge.Application.Services.Authentication;
using MediatR;

namespace FlowForge.Application.Features.WorkItemWatchers.Delete;

public sealed class DeleteWorkItemWatcherCommandHandler : IRequestHandler<DeleteWorkItemWatcherCommand, ApiResponse<DeleteWorkItemWatcherResponse>>
{
    private readonly WorkItemWatcherRules _rules;
    private readonly ICurrentUserService _currentUser;

    public DeleteWorkItemWatcherCommandHandler(WorkItemWatcherRules rules, ICurrentUserService currentUser)
    {
        _rules = rules;
        _currentUser = currentUser;
    }

    public async Task<ApiResponse<DeleteWorkItemWatcherResponse>> Handle(DeleteWorkItemWatcherCommand request, CancellationToken cancellationToken)
    {
        var currentUser = _currentUser.User;

        var watcher = await _rules.GetByIdAsync(request.WatcherId, currentUser.OrganizationId, cancellationToken);

        _rules.EnsureWorkItemNotArchived(watcher.WorkItem);

        watcher.Delete();

        await _rules.SaveChangesAsync(cancellationToken);

        return ApiResponse<DeleteWorkItemWatcherResponse>
            .SuccessResponse(
                new DeleteWorkItemWatcherResponse
                {
                    Id = watcher.Id
                },
                "Watcher removed successfully.");
    }
}