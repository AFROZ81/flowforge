using FlowForge.Application.Common.Responses;
using FlowForge.Application.Interfaces;
using FlowForge.Application.Services.Authentication;
using MediatR;

namespace FlowForge.Application.Features.WorkItems.Block;

public sealed class BlockWorkItemCommandHandler : IRequestHandler<BlockWorkItemCommand, ApiResponse<BlockWorkItemResponse>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly WorkItemRules _rules;

    public BlockWorkItemCommandHandler(IApplicationDbContext context, ICurrentUserService currentUser, WorkItemRules rules)
    {
        _context = context;
        _currentUser = currentUser;
        _rules = rules;
    }

    public async Task<ApiResponse<BlockWorkItemResponse>> Handle(BlockWorkItemCommand request, CancellationToken cancellationToken)
    {
        var workItem = await _rules.GetByIdAsync(request.WorkItemId, _currentUser.User.OrganizationId, cancellationToken);

        _rules.EnsureNotArchived(workItem);

        workItem.MarkBlocked();

        await _context.SaveChangesAsync(cancellationToken);

        return ApiResponse<BlockWorkItemResponse>.SuccessResponse(
            new BlockWorkItemResponse
            {
                Id = workItem.Id,
                Status = workItem.Status
            },
            "Work Item blocked successfully.");
    }
}