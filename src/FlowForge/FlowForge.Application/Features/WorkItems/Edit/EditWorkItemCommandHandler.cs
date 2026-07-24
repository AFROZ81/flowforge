using FlowForge.Application.Common.Responses;
using FlowForge.Application.Interfaces;
using FlowForge.Application.Services.Authentication;
using MediatR;

namespace FlowForge.Application.Features.WorkItems.Edit;

public sealed class EditWorkItemCommandHandler
    : IRequestHandler<EditWorkItemCommand, ApiResponse<EditWorkItemResponse>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly WorkItemRules _rules;

    public EditWorkItemCommandHandler(IApplicationDbContext context, ICurrentUserService currentUser, WorkItemRules rules)
    {
        _context = context;
        _currentUser = currentUser;
        _rules = rules;
    }

    public async Task<ApiResponse<EditWorkItemResponse>> Handle(EditWorkItemCommand request, CancellationToken cancellationToken)
    {
        var workItem = await _rules.GetByIdAsync(request.WorkItemId, _currentUser.User.OrganizationId, cancellationToken);

        _rules.EnsureNotArchived(workItem);

        workItem.Edit(request.Description, request.Priority, request.DueDate);

        await _context.SaveChangesAsync(cancellationToken);

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