using FlowForge.Application.Common.Responses;
using FlowForge.Application.Interfaces;
using FlowForge.Application.Services.Authentication;
using FlowForge.Application.Services.WorkItemHistories;
using FlowForge.Domain.Enums;

using MediatR;

namespace FlowForge.Application.Features.Labels.Remove;

public sealed class RemoveLabelCommandHandler : IRequestHandler<RemoveLabelCommand, ApiResponse<RemoveLabelResponse>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly LabelRules _labelRules;
    private readonly IWorkItemHistoryService _historyService;

    public RemoveLabelCommandHandler(IApplicationDbContext context, ICurrentUserService currentUser, LabelRules labelRules, IWorkItemHistoryService historyService)
    {
        _context = context;
        _currentUser = currentUser;
        _labelRules = labelRules;
        _historyService = historyService;
    }

    public async Task<ApiResponse<RemoveLabelResponse>> Handle(RemoveLabelCommand request, CancellationToken cancellationToken)
    {
        var currentUser = _currentUser.User;

        var workItem = await _labelRules.GetWorkItemAsync(request.WorkItemId, currentUser.OrganizationId, cancellationToken);

        _labelRules.EnsureWorkItemNotArchived(workItem);

        var label = await _labelRules.GetByIdAsync(request.LabelId, currentUser.OrganizationId, cancellationToken);

        var assignment = await _labelRules.GetActiveAssignmentAsync(workItem.Id, label.Id, cancellationToken);

        assignment.Remove();

        await _context.SaveChangesAsync(cancellationToken);

        await _historyService.CreateAsync(
            workItem.Id,
            currentUser.UserId,
            WorkItemHistoryAction.LabelRemoved,
            $"{currentUser.FullName} removed label \"{label.Name}\".",
            cancellationToken);

        return ApiResponse<RemoveLabelResponse>.SuccessResponse(
            new RemoveLabelResponse
            {
                WorkItemId = assignment.WorkItemId,
                LabelId = assignment.LabelId,
                IsDeleted = assignment.IsDeleted,
                DeletedAt = assignment.DeletedAt
            },
            "Label removed successfully.");
    }
}