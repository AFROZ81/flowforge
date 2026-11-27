using System.Text.Json;
using FlowForge.Application.Common.Constants;
using FlowForge.Application.Common.Exceptions;
using FlowForge.Application.Common.Responses;
using FlowForge.Application.Interfaces;
using FlowForge.Application.Services.AuditLogs;
using FlowForge.Application.Services.Authentication;
using FlowForge.Application.Services.Realtime;
using FlowForge.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace FlowForge.Application.Features.WorkItems.Delete;

public sealed class DeleteWorkItemCommandHandler : IRequestHandler<DeleteWorkItemCommand, ApiResponse<DeleteWorkItemResponse>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly WorkItemRules _rules;
    private readonly IAuditLogService _auditLogService;
    private readonly IRealtimeNotifier _realtimeNotifier;
    private readonly ILogger<DeleteWorkItemCommandHandler> _logger;

    public DeleteWorkItemCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser,
        WorkItemRules rules,
        IAuditLogService auditLogService,
        IRealtimeNotifier realtimeNotifier,
        ILogger<DeleteWorkItemCommandHandler> logger)
    {
        _context = context;
        _currentUser = currentUser;
        _rules = rules;
        _auditLogService = auditLogService;
        _realtimeNotifier = realtimeNotifier;
        _logger = logger;
    }

    public async Task<ApiResponse<DeleteWorkItemResponse>> Handle(DeleteWorkItemCommand request, CancellationToken cancellationToken)
    {
        var currentUser = _currentUser.User;
        if (currentUser.Role != UserRole.Admin)
        {
            throw new ForbiddenException("Only admins can delete work items.");
        }

        var workItem = await _rules.GetByIdAsync(
            request.WorkItemId,
            currentUser.OrganizationId,
            cancellationToken);

        var boardId = workItem.Column.BoardId;
        var attachments = await _context.Attachments
            .Where(x => x.WorkItemId == workItem.Id)
            .ToListAsync(cancellationToken);
        var comments = await _context.Comments
            .Where(x => x.WorkItemId == workItem.Id)
            .ToListAsync(cancellationToken);
        var labels = await _context.WorkItemLabels
            .Where(x => x.WorkItemId == workItem.Id)
            .ToListAsync(cancellationToken);
        var notifications = await _context.Notifications
            .Where(x => x.WorkItemId == workItem.Id)
            .ToListAsync(cancellationToken);
        var watchers = await _context.WorkItemWatchers
            .Where(x => x.WorkItemId == workItem.Id)
            .ToListAsync(cancellationToken);
        var checklistItems = await _context.ChecklistItems
            .Where(x => x.WorkItemId == workItem.Id)
            .ToListAsync(cancellationToken);
        var history = await _context.WorkItemHistories
            .Where(x => x.WorkItemId == workItem.Id)
            .ToListAsync(cancellationToken);

        workItem.Delete();
        foreach (var attachment in attachments) attachment.Delete();
        foreach (var comment in comments) comment.Delete();
        foreach (var label in labels) label.Remove();
        foreach (var notification in notifications) notification.Delete();
        foreach (var watcher in watchers) watcher.Delete();
        foreach (var checklistItem in checklistItems) checklistItem.Delete();
        foreach (var historyItem in history) historyItem.Delete();

        await _context.ExecuteInTransactionAsync(async () =>
        {
            await _context.SaveChangesAsync(cancellationToken);

            await _auditLogService.CreateAsync(new AuditLogEntry
            {
                Type = AuditLogType.WorkItemDeleted,
                OrganizationId = currentUser.OrganizationId,
                ActorId = currentUser.UserId,
                ActorName = currentUser.FullName,
                TargetEntityId = workItem.Id,
                TargetEntityType = "WorkItem",
                Action = "Deleted",
                Description = $"Soft-deleted work item \"{workItem.Title}\".",
                OldValuesJson = JsonSerializer.Serialize(new
                {
                    workItem.Title,
                    Status = workItem.Status.ToString(),
                    ColumnId = workItem.ColumnId,
                }),
                IsSensitive = true,
            }, cancellationToken);
        }, cancellationToken);

        try
        {
            await _realtimeNotifier.NotifyBoardAsync(
                boardId,
                RealtimeEvents.WorkItemDeleted,
                new { BoardId = boardId, WorkItemId = workItem.Id },
                cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(
                ex,
                "Deleted work item {WorkItemId}, but failed to send its realtime notification.",
                workItem.Id);
        }

        return ApiResponse<DeleteWorkItemResponse>.SuccessResponse(
            new DeleteWorkItemResponse
            {
                Id = workItem.Id,
                DeletedAt = workItem.DeletedAt ?? DateTime.UtcNow,
            },
            "Work item deleted.");
    }
}
