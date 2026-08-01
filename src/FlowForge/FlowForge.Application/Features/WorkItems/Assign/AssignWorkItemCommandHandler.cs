using FlowForge.Application.Common.Exceptions;
using FlowForge.Application.Common.Responses;
using FlowForge.Application.Interfaces;
using FlowForge.Application.Services.Authentication;
using FlowForge.Application.Services.Notifications;
using FlowForge.Application.Services.Users;
using FlowForge.Domain.Enums;
using FlowForge.Application.Services.WorkItemHistories;

using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FlowForge.Application.Features.WorkItems.Assign;

public sealed class AssignWorkItemCommandHandler : IRequestHandler<AssignWorkItemCommand, ApiResponse<AssignWorkItemResponse>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly IUserService _userService;
    private readonly INotificationService _notificationService;
    private readonly IWorkItemHistoryService _historyService;

    public AssignWorkItemCommandHandler(IApplicationDbContext context, ICurrentUserService currentUser, IUserService userService, INotificationService notificationService, IWorkItemHistoryService historyService)
    {
        _context = context;
        _currentUser = currentUser;
        _userService = userService;
        _notificationService = notificationService;
        _historyService = historyService;
    }

    public async Task<ApiResponse<AssignWorkItemResponse>> Handle(AssignWorkItemCommand request, CancellationToken cancellationToken)
    {
        var currentUser = _currentUser.User;

        var workItem = await _context.WorkItems
            .Include(x => x.Column)
                .ThenInclude(x => x.Board)
                    .ThenInclude(x => x.Project)
            .FirstOrDefaultAsync(
                x =>
                    x.Id == request.WorkItemId &&
                    !x.IsDeleted &&
                    x.Column.Board.Project.OrganizationId ==
                        currentUser.OrganizationId,
                cancellationToken);

        if (workItem is null)
            throw new NotFoundException("Work Item not found.");

        if (workItem.IsArchived)
            throw new BadRequestException(
                "Archived Work Items cannot be assigned.");

        var assignee = await _userService.GetByIdAsync(request.AssigneeId, cancellationToken);

        if (assignee is null)
            throw new NotFoundException("User not found.");

        if (assignee.OrganizationId != currentUser.OrganizationId)
            throw new BadRequestException(
                "The selected user does not belong to this organization.");

        if (workItem.AssigneeId == assignee.Id)
            throw new BadRequestException(
                "Work Item is already assigned to this user.");

        workItem.AssignTo(assignee.Id);

        await _notificationService.CreateAsync(currentUser.OrganizationId, assignee.Id, NotificationType.WorkItemAssigned, "Work Item assigned", $"You have been assigned to \"{workItem.Title}\".", workItem.Id, cancellationToken);

        await _context.SaveChangesAsync(cancellationToken);

        await _historyService.CreateAsync(
            workItem.Id,
            currentUser.UserId,
            WorkItemHistoryAction.Assigned,
            $"{currentUser.FullName} assigned the Work Item to {assignee.FullName}.",
            cancellationToken);

        return ApiResponse<AssignWorkItemResponse>
            .SuccessResponse(
                new AssignWorkItemResponse
                {
                    WorkItemId = workItem.Id,
                    AssigneeId = assignee.Id,
                    AssigneeName = assignee.FullName
                },
                "Work Item assigned successfully.");
    }
}