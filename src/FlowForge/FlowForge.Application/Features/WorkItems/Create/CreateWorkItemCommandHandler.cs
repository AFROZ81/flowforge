using FlowForge.Application.Common.Responses;
using FlowForge.Application.Interfaces;
using FlowForge.Application.Services.Authentication;
using FlowForge.Domain.Entities;
using FlowForge.Application.Services.WorkItems;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FlowForge.Application.Features.WorkItems.Create;

public sealed class CreateWorkItemCommandHandler : IRequestHandler<CreateWorkItemCommand, ApiResponse<CreateWorkItemResponse>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly WorkItemRules _workItemRules;
    private readonly IWorkItemOrderingService _orderingService;

    public CreateWorkItemCommandHandler(IApplicationDbContext context, ICurrentUserService currentUser, WorkItemRules workItemRules, IWorkItemOrderingService orderingService)
    {
        _context = context;
        _currentUser = currentUser;
        _workItemRules = workItemRules;
        _orderingService = orderingService;
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