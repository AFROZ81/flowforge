using FlowForge.Application.Common.Responses;
using FlowForge.Application.Interfaces;
using FlowForge.Application.Services.Authentication;
using FlowForge.Application.Common.Constants;
using FlowForge.Application.Services.Realtime;
using Microsoft.EntityFrameworkCore;

using MediatR;

namespace FlowForge.Application.Features.WorkItems.Archive;

public sealed class ArchiveWorkItemCommandHandler : IRequestHandler<ArchiveWorkItemCommand, ApiResponse<ArchiveWorkItemResponse>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly WorkItemRules _rules;
    private readonly IRealtimeNotifier _realtimeNotifier;

    public ArchiveWorkItemCommandHandler(IApplicationDbContext context, ICurrentUserService currentUser, WorkItemRules rules, IRealtimeNotifier realtimeNotifier)
    {
        _context = context;
        _currentUser = currentUser;
        _rules = rules;
        _realtimeNotifier = realtimeNotifier;
        _rules = rules;
    }

    public async Task<ApiResponse<ArchiveWorkItemResponse>> Handle(ArchiveWorkItemCommand request, CancellationToken cancellationToken)
    {
        var workItem = await _rules.GetByIdAsync(request.WorkItemId, _currentUser.User.OrganizationId, cancellationToken);

        _rules.EnsureNotArchived(workItem);

        workItem.Archive();

        await _context.SaveChangesAsync(cancellationToken);

        var boardId = await _context.Columns
            .Where(c => c.Id == workItem.ColumnId)
            .Select(c => c.BoardId)
            .SingleAsync(cancellationToken);

        await _realtimeNotifier.NotifyBoardAsync(
            boardId,
            RealtimeEvents.WorkItemDeleted,
            new
            {
                BoardId = boardId,
                WorkItemId = workItem.Id
            },
            cancellationToken);

        return ApiResponse<ArchiveWorkItemResponse>.SuccessResponse(
            new ArchiveWorkItemResponse
            {
                Id = workItem.Id,
                IsArchived = workItem.IsArchived
            },
            "Work Item archived successfully.");
    }
}