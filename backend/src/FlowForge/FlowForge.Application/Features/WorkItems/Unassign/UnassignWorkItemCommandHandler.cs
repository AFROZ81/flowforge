using FlowForge.Application.Common.Exceptions;
using FlowForge.Application.Common.Responses;
using FlowForge.Application.Interfaces;
using FlowForge.Application.Services.Authentication;
using FlowForge.Application.Common.Constants;
using FlowForge.Application.Services.Realtime;

using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FlowForge.Application.Features.WorkItems.Unassign;

public sealed class UnassignWorkItemCommandHandler : IRequestHandler<UnassignWorkItemCommand, ApiResponse<UnassignWorkItemResponse>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly IRealtimeNotifier _realtimeNotifier;

    public UnassignWorkItemCommandHandler(IApplicationDbContext context, ICurrentUserService currentUser, IRealtimeNotifier realtimeNotifier)
    {
        _context = context;
        _currentUser = currentUser;
        _realtimeNotifier = realtimeNotifier;
    }

    public async Task<ApiResponse<UnassignWorkItemResponse>> Handle(UnassignWorkItemCommand request, CancellationToken cancellationToken)
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
                "Archived Work Items cannot be unassigned.");

        if (!workItem.AssigneeId.HasValue)
            throw new BadRequestException(
                "Work Item is not currently assigned.");

        workItem.Unassign();

        await _context.SaveChangesAsync(cancellationToken);

        await _realtimeNotifier.NotifyBoardAsync(
            workItem.Column.BoardId,
            RealtimeEvents.WorkItemUpdated,
            new
            {
                BoardId = workItem.Column.BoardId,
                WorkItemId = workItem.Id,
                AssigneeId = (Guid?)null
            },
            cancellationToken);

        return ApiResponse<UnassignWorkItemResponse>
            .SuccessResponse(
                new UnassignWorkItemResponse
                {
                    WorkItemId = workItem.Id,
                    AssigneeId = workItem.AssigneeId
                },
                "Work Item unassigned successfully.");
    }
}