using FlowForge.Application.Common.Responses;
using FlowForge.Application.Interfaces;
using FlowForge.Application.Services.Authentication;
using MediatR;

namespace FlowForge.Application.Features.WorkItems.Activate;

public sealed class ActivateWorkItemCommandHandler : IRequestHandler<ActivateWorkItemCommand, ApiResponse<ActivateWorkItemResponse>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly WorkItemRules _rules;

    public ActivateWorkItemCommandHandler(IApplicationDbContext context, ICurrentUserService currentUser, WorkItemRules rules)
    {
        _context = context;
        _currentUser = currentUser;
        _rules = rules;
    }

    public async Task<ApiResponse<ActivateWorkItemResponse>> Handle(ActivateWorkItemCommand request, CancellationToken cancellationToken)
    {
        var workItem = await _rules.GetByIdAsync(request.WorkItemId, _currentUser.User.OrganizationId, cancellationToken);

        _rules.EnsureNotArchived(workItem);

        workItem.Activate();

        await _context.SaveChangesAsync(cancellationToken);

        return ApiResponse<ActivateWorkItemResponse>.SuccessResponse(new ActivateWorkItemResponse
        {
            Id = workItem.Id,
            Status = workItem.Status
        },
        "Work Item activated successfully.");
    }
}