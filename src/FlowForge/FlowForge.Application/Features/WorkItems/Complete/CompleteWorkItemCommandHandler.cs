using FlowForge.Application.Common.Responses;
using FlowForge.Application.Interfaces;
using FlowForge.Application.Services.Authentication;
using MediatR;

namespace FlowForge.Application.Features.WorkItems.Complete;

public sealed class CompleteWorkItemCommandHandler : IRequestHandler<CompleteWorkItemCommand, ApiResponse<CompleteWorkItemResponse>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly WorkItemRules _rules;

    public CompleteWorkItemCommandHandler(IApplicationDbContext context, ICurrentUserService currentUser, WorkItemRules rules)
    {
        _context = context;
        _currentUser = currentUser;
        _rules = rules;
    }

    public async Task<ApiResponse<CompleteWorkItemResponse>> Handle(CompleteWorkItemCommand request, CancellationToken cancellationToken)
    {
        var workItem = await _rules.GetByIdAsync(request.WorkItemId, _currentUser.User.OrganizationId, cancellationToken);

        _rules.EnsureNotArchived(workItem);

        workItem.MarkCompleted();

        await _context.SaveChangesAsync(cancellationToken);

        return ApiResponse<CompleteWorkItemResponse>.SuccessResponse(
            new CompleteWorkItemResponse
            {
                Id = workItem.Id,
                Status = workItem.Status
            },
            "Work Item marked as completed successfully.");
    }
}