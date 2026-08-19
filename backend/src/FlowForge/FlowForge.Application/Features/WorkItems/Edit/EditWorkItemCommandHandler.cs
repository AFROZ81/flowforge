using FlowForge.Application.Common.Constants;
using FlowForge.Application.Common.Responses;
using FlowForge.Application.Interfaces;
using FlowForge.Application.Services.Authentication;
using FlowForge.Application.Services.Realtime;

using MediatR;

using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace FlowForge.Application.Features.WorkItems.Edit;

public sealed class EditWorkItemCommandHandler
    : IRequestHandler<
        EditWorkItemCommand,
        ApiResponse<EditWorkItemResponse>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly WorkItemRules _rules;
    private readonly IRealtimeNotifier _realtimeNotifier;
    private readonly ILogger<EditWorkItemCommandHandler> _logger;

    public EditWorkItemCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser,
        WorkItemRules rules,
        IRealtimeNotifier realtimeNotifier,
        ILogger<EditWorkItemCommandHandler> logger)
    {
        _context = context;
        _currentUser = currentUser;
        _rules = rules;
        _realtimeNotifier = realtimeNotifier;
        _logger = logger;
    }

    public async Task<ApiResponse<EditWorkItemResponse>> Handle(
        EditWorkItemCommand request,
        CancellationToken cancellationToken)
    {
        // ---------------------------------------------------------
        // 1. Load work item
        // ---------------------------------------------------------

        var workItem = await _rules.GetByIdAsync(
            request.WorkItemId,
            _currentUser.User.OrganizationId,
            cancellationToken);

        // ---------------------------------------------------------
        // 2. Validate work item
        // ---------------------------------------------------------

        _rules.EnsureNotArchived(workItem);

        // ---------------------------------------------------------
        // 3. Apply changes
        // ---------------------------------------------------------

        workItem.Edit(
            request.Description,
            request.Priority,
            request.DueDate);

        // ---------------------------------------------------------
        // 4. Save database changes
        // ---------------------------------------------------------

        await _context.SaveChangesAsync(
            cancellationToken);

        // ---------------------------------------------------------
        // 5. Get board ID
        //
        // Do NOT allow failure here to turn a successful edit
        // into HTTP 500.
        // ---------------------------------------------------------

        Guid? boardId = null;

        try
        {
            boardId = await _context.Columns
                .Where(c => c.Id == workItem.ColumnId)
                .Select(c => (Guid?)c.BoardId)
                .FirstOrDefaultAsync(
                    cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(
                ex,
                "Failed to resolve board ID for edited WorkItem {WorkItemId}.",
                workItem.Id);
        }

        // ---------------------------------------------------------
        // 6. Realtime notification
        //
        // Realtime must NEVER make the actual database update fail.
        // ---------------------------------------------------------

        if (boardId.HasValue)
        {
            try
            {
                await _realtimeNotifier.NotifyBoardAsync(
                    boardId.Value,
                    RealtimeEvents.WorkItemUpdated,
                    new
                    {
                        BoardId = boardId.Value,
                        WorkItemId = workItem.Id,
                        Description = workItem.Description,
                        Priority = workItem.Priority,
                        DueDate = workItem.DueDate
                    },
                    cancellationToken);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(
                    ex,
                    "WorkItem {WorkItemId} was updated successfully, " +
                    "but realtime notification failed.",
                    workItem.Id);
            }
        }

        // ---------------------------------------------------------
        // 7. Return successful response
        // ---------------------------------------------------------

        return ApiResponse<EditWorkItemResponse>.SuccessResponse(
            new EditWorkItemResponse
            {
                Id = workItem.Id,
                Description = workItem.Description,
                Priority = workItem.Priority,
                DueDate = workItem.DueDate
            },
            "Work Item updated successfully.");
    }
}