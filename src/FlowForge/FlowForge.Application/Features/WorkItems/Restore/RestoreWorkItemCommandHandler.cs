using FlowForge.Application.Common.Responses;
using FlowForge.Application.Interfaces;
using FlowForge.Application.Services.Authentication;
using MediatR;

namespace FlowForge.Application.Features.WorkItems.Restore;

public sealed class RestoreWorkItemCommandHandler : IRequestHandler<RestoreWorkItemCommand, ApiResponse<RestoreWorkItemResponse>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly WorkItemRules _rules;

    public RestoreWorkItemCommandHandler(IApplicationDbContext context, ICurrentUserService currentUser, WorkItemRules rules)
    {
        _context = context;
        _currentUser = currentUser;
        _rules = rules;
    }

    public async Task<ApiResponse<RestoreWorkItemResponse>> Handle(RestoreWorkItemCommand request, CancellationToken cancellationToken)
    {
        var workItem = await _rules.GetByIdAsync(request.WorkItemId, _currentUser.User.OrganizationId, cancellationToken);

        _rules.EnsureArchived(workItem);

        workItem.Restore();

        await _context.SaveChangesAsync(cancellationToken);

        return ApiResponse<RestoreWorkItemResponse>.SuccessResponse(
        new RestoreWorkItemResponse
        {
            Id = workItem.Id,
            IsArchived = workItem.IsArchived
        },
        "Work Item restored successfully.");
    }
}