using FlowForge.Application.Common.Responses;
using FlowForge.Application.Interfaces;
using FlowForge.Application.Services.Authentication;
using FlowForge.Application.Services.WorkItems;
using MediatR;

namespace FlowForge.Application.Features.WorkItems.Move;

public sealed class MoveWorkItemCommandHandler
    : IRequestHandler<MoveWorkItemCommand, ApiResponse<MoveWorkItemResponse>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly WorkItemRules _rules;
    private readonly IWorkItemOrderingService _orderingService;

    public MoveWorkItemCommandHandler(IApplicationDbContext context, ICurrentUserService currentUser, WorkItemRules rules, IWorkItemOrderingService orderingService)
    {
        _context = context;
        _currentUser = currentUser;
        _rules = rules;
        _orderingService = orderingService;
    }

    public async Task<ApiResponse<MoveWorkItemResponse>> Handle(MoveWorkItemCommand request, CancellationToken cancellationToken)
    {
        var workItem = await _rules.GetByIdAsync(request.WorkItemId, _currentUser.User.OrganizationId, cancellationToken);

        _rules.EnsureNotArchived(workItem);

        var destinationColumn = await _rules.GetColumnAsync(request.DestinationColumnId, _currentUser.User.OrganizationId, cancellationToken);

        _rules.EnsureColumnNotArchived(destinationColumn);

        var displayOrder = await _orderingService.GetNextDisplayOrderAsync(destinationColumn.Id, workItem.Id, request.DestinationIndex, cancellationToken);

        if (workItem.ColumnId == destinationColumn.Id && workItem.DisplayOrder == displayOrder)
        {
            return ApiResponse<MoveWorkItemResponse>.SuccessResponse(
                new MoveWorkItemResponse
                {
                    Id = workItem.Id,
                    ColumnId = workItem.ColumnId,
                    DisplayOrder = workItem.DisplayOrder
                },
                "Work Item position unchanged.");
        }

        workItem.MoveToColumn(destinationColumn.Id, displayOrder);

        await _context.SaveChangesAsync(cancellationToken);

        return ApiResponse<MoveWorkItemResponse>.SuccessResponse(
            new MoveWorkItemResponse
            {
                Id = workItem.Id,
                ColumnId = workItem.ColumnId,
                DisplayOrder = workItem.DisplayOrder
            },
            "Work Item moved successfully.");
    }
}