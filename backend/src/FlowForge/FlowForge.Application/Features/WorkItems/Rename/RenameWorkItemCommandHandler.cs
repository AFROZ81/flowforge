using FlowForge.Application.Common.Exceptions;
using FlowForge.Application.Common.Responses;
using FlowForge.Application.Interfaces;
using FlowForge.Application.Services.Authentication;
using FlowForge.Application.Common.Constants;
using FlowForge.Application.Services.Realtime;
using FlowForge.Domain.Enums;
using Microsoft.EntityFrameworkCore;

using MediatR;

namespace FlowForge.Application.Features.WorkItems.Rename;

public sealed class RenameWorkItemCommandHandler
    : IRequestHandler<RenameWorkItemCommand, ApiResponse<RenameWorkItemResponse>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly WorkItemRules _rules;
    private readonly IRealtimeNotifier _realtimeNotifier;

    public RenameWorkItemCommandHandler(IApplicationDbContext context, ICurrentUserService currentUser, WorkItemRules rules, IRealtimeNotifier realtimeNotifier)
    {
        _context = context;
        _currentUser = currentUser;
        _rules = rules;
        _realtimeNotifier = realtimeNotifier;
    }

    public async Task<ApiResponse<RenameWorkItemResponse>> Handle(RenameWorkItemCommand request, CancellationToken cancellationToken)
    {
        if (_currentUser.User.Role != UserRole.Admin)
        {
            throw new ForbiddenException("Only admins can rename work items.");
        }

        var workItem = await _rules.GetByIdAsync(request.WorkItemId, _currentUser.User.OrganizationId, cancellationToken);

        _rules.EnsureNotArchived(workItem);

        await _rules.EnsureTitleUniqueAsync(workItem.ColumnId, request.Title, workItem.Id, cancellationToken);

        workItem.Rename(request.Title);

        await _context.SaveChangesAsync(cancellationToken);

        var boardId = await _context.Columns
            .Where(c => c.Id == workItem.ColumnId)
            .Select(c => c.BoardId)
            .SingleAsync(cancellationToken);

        await _realtimeNotifier.NotifyBoardAsync(
            boardId,
            RealtimeEvents.WorkItemUpdated,
            new
            {
                BoardId = boardId,
                WorkItemId = workItem.Id,
                Title = workItem.Title
            },
            cancellationToken);

        return ApiResponse<RenameWorkItemResponse>.SuccessResponse(
            new RenameWorkItemResponse
            {
                Id = workItem.Id,
                Title = workItem.Title,
            },
            "Work Item renamed successfully.");
    }
}