using FlowForge.Application.Common.Responses;
using FlowForge.Application.Interfaces;
using FlowForge.Application.Services.Authentication;
using FlowForge.Application.Common.Constants;
using FlowForge.Application.Services.Realtime;
using Microsoft.EntityFrameworkCore;

using MediatR;

namespace FlowForge.Application.Features.WorkItems.Restore;

public sealed class RestoreWorkItemCommandHandler : IRequestHandler<RestoreWorkItemCommand, ApiResponse<RestoreWorkItemResponse>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly WorkItemRules _rules;
    private readonly IRealtimeNotifier _realtimeNotifier;

    public RestoreWorkItemCommandHandler(IApplicationDbContext context, ICurrentUserService currentUser, WorkItemRules rules, IRealtimeNotifier realtimeNotifier)
    {
        _context = context;
        _currentUser = currentUser;
        _rules = rules;
        _realtimeNotifier = realtimeNotifier;
    }

    public async Task<ApiResponse<RestoreWorkItemResponse>> Handle(RestoreWorkItemCommand request, CancellationToken cancellationToken)
    {
        var workItem = await _rules.GetByIdAsync(request.WorkItemId, _currentUser.User.OrganizationId, cancellationToken);

        _rules.EnsureArchived(workItem);

        workItem.Restore();

        await _context.SaveChangesAsync(cancellationToken);

        var boardId = await _context.Columns
            .Where(c => c.Id == workItem.ColumnId)
            .Select(c => c.BoardId)
            .SingleAsync(cancellationToken);

        await _realtimeNotifier.NotifyBoardAsync(
            boardId,
            RealtimeEvents.WorkItemCreated,
            new
            {
                BoardId = boardId,
                WorkItemId = workItem.Id
            },
            cancellationToken);

        return ApiResponse<RestoreWorkItemResponse>.SuccessResponse(
        new RestoreWorkItemResponse
        {
            Id = workItem.Id,
            IsArchived = workItem.IsArchived
        },
        "Work Item restored successfully.");
    }
}