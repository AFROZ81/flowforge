using FlowForge.Application.Common.Responses;
using FlowForge.Application.Interfaces;
using FlowForge.Application.Services.Authentication;
using FlowForge.Domain.Entities;
using FlowForge.Application.Common.Exceptions;
using MediatR;

namespace FlowForge.Application.Features.Labels.Assign;

public sealed class AssignLabelCommandHandler : IRequestHandler<AssignLabelCommand, ApiResponse<AssignLabelResponse>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly LabelRules _labelRules;

    public AssignLabelCommandHandler(IApplicationDbContext context, ICurrentUserService currentUser, LabelRules labelRules)
    {
        _context = context;
        _currentUser = currentUser;
        _labelRules = labelRules;
    }

    public async Task<ApiResponse<AssignLabelResponse>> Handle(AssignLabelCommand request, CancellationToken cancellationToken)
    {
        var currentUser = _currentUser.User;

        var workItem = await _labelRules.GetWorkItemAsync(request.WorkItemId, currentUser.OrganizationId, cancellationToken);

        _labelRules.EnsureWorkItemNotArchived(workItem);

        var label = await _labelRules.GetByIdAsync(request.LabelId, currentUser.OrganizationId, cancellationToken);

        var workItemLabel = await _labelRules.GetAssignmentAsync(workItem.Id, label.Id, cancellationToken);

        if (workItemLabel is not null)
        {
            if (!workItemLabel.IsDeleted)
                throw new BadRequestException("This label is already assigned to the Work Item.");

            workItemLabel.Restore();
        }
        else
        {
            workItemLabel = new WorkItemLabel(workItem.Id, label.Id);

            _context.WorkItemLabels.Add(workItemLabel);
        }

        await _context.SaveChangesAsync(cancellationToken);

        return ApiResponse<AssignLabelResponse>.SuccessResponse(
            new AssignLabelResponse
            {
                Id = workItemLabel.Id,
                WorkItemId = workItemLabel.WorkItemId,
                LabelId = workItemLabel.LabelId,
                LabelName = label.Name,
                Color = label.Color,
                CreatedAt = workItemLabel.CreatedAt
            },
            "Label assigned successfully.");
    }
}