using FlowForge.Application.Common.Responses;
using FlowForge.Application.Interfaces;
using FlowForge.Application.Services.Authentication;
using FlowForge.Domain.Entities;
using FlowForge.Application.Services.WorkItems;
using FlowForge.Application.Services.WorkItemHistories;
using FlowForge.Application.Services.Realtime;
using FlowForge.Application.Common.Constants;
using FlowForge.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FlowForge.Application.Features.WorkItems.Create;

public sealed class CreateWorkItemCommandHandler : IRequestHandler<CreateWorkItemCommand, ApiResponse<CreateWorkItemResponse>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly WorkItemRules _workItemRules;
    private readonly IWorkItemOrderingService _orderingService;
    private readonly IWorkItemHistoryService _historyService;
    private readonly IRealtimeNotifier _realtimeNotifier;

    public CreateWorkItemCommandHandler(IApplicationDbContext context, ICurrentUserService currentUser, WorkItemRules workItemRules, IWorkItemOrderingService orderingService, IWorkItemHistoryService historyService, IRealtimeNotifier realtimeNotifier)
    {
        _context = context;
        _currentUser = currentUser;
        _workItemRules = workItemRules;
        _orderingService = orderingService;
        _historyService = historyService;
        _realtimeNotifier = realtimeNotifier;
    }

    public async Task<ApiResponse<CreateWorkItemResponse>> Handle(CreateWorkItemCommand request, CancellationToken cancellationToken)
    {
        var column = await _workItemRules.GetColumnAsync(request.ColumnId, _currentUser.User.OrganizationId, cancellationToken);

        _workItemRules.EnsureColumnNotArchived(column);

        await _workItemRules.EnsureTitleUniqueAsync(request.ColumnId, request.Title, null, cancellationToken);

        var displayOrder = await _orderingService.GetNextDisplayOrderAsync(request.ColumnId, null, int.MaxValue, cancellationToken);

        var workItem = new WorkItem(request.ColumnId, request.Title, request.Description, request.Priority, request.DueDate, displayOrder);

        _context.WorkItems.Add(workItem);

        await _context.SaveChangesAsync(cancellationToken);

        var currentUser = _currentUser.User;

        await _historyService.CreateAsync(
            workItem.Id,
            currentUser.UserId,
            WorkItemHistoryAction.Created,
            $"{currentUser.FullName} created the Work Item.",
            cancellationToken);

        await _realtimeNotifier.NotifyBoardAsync(
            column.BoardId,
            RealtimeEvents.WorkItemCreated,
            new
            {
                BoardId = column.BoardId,
                ColumnId = workItem.ColumnId,
                WorkItemId = workItem.Id,
                Title = workItem.Title,
                Description = workItem.Description,
                Priority = workItem.Priority,
                Status = workItem.Status,
                DisplayOrder = workItem.DisplayOrder
            },
            cancellationToken);

        return ApiResponse<CreateWorkItemResponse>.SuccessResponse(
            new CreateWorkItemResponse
            {
                Id = workItem.Id,
                ColumnId = workItem.ColumnId,
                Title = workItem.Title,
                Priority = workItem.Priority,
                Status = workItem.Status,
                DisplayOrder = workItem.DisplayOrder
            },
            "Work Item created successfully.");
    }
}