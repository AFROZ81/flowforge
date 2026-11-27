using FlowForge.Application.Common.Exceptions;
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
        var workItem = await _rules.GetByIdIncludingDeletedAsync(request.WorkItemId, _currentUser.User.OrganizationId, cancellationToken);

        if (!workItem.IsArchived && !workItem.IsDeleted)
            throw new BadRequestException("Work Item is not archived or deleted.");

        workItem.Restore();
        workItem.RestoreDeleted();

        var attachments = await _context.Attachments
            .IgnoreQueryFilters()
            .Where(x => x.WorkItemId == workItem.Id)
            .ToListAsync(cancellationToken);
        var comments = await _context.Comments
            .IgnoreQueryFilters()
            .Where(x => x.WorkItemId == workItem.Id)
            .ToListAsync(cancellationToken);
        var labels = await _context.WorkItemLabels
            .IgnoreQueryFilters()
            .Where(x => x.WorkItemId == workItem.Id)
            .ToListAsync(cancellationToken);
        var notifications = await _context.Notifications
            .IgnoreQueryFilters()
            .Where(x => x.WorkItemId == workItem.Id)
            .ToListAsync(cancellationToken);
        var watchers = await _context.WorkItemWatchers
            .IgnoreQueryFilters()
            .Where(x => x.WorkItemId == workItem.Id)
            .ToListAsync(cancellationToken);
        var checklistItems = await _context.ChecklistItems
            .IgnoreQueryFilters()
            .Where(x => x.WorkItemId == workItem.Id)
            .ToListAsync(cancellationToken);
        var history = await _context.WorkItemHistories
            .IgnoreQueryFilters()
            .Where(x => x.WorkItemId == workItem.Id)
            .ToListAsync(cancellationToken);

        foreach (var attachment in attachments) attachment.RestoreDeleted();
        foreach (var comment in comments) comment.RestoreDeleted();
        foreach (var label in labels) label.RestoreDeleted();
        foreach (var notification in notifications) notification.RestoreDeleted();
        foreach (var watcher in watchers) watcher.RestoreDeleted();
        foreach (var checklistItem in checklistItems) checklistItem.RestoreDeleted();
        foreach (var historyItem in history) historyItem.RestoreDeleted();

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