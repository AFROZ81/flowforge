using FlowForge.Application.Common.Responses;
using FlowForge.Application.Interfaces;
using FlowForge.Application.Services.Authentication;
using MediatR;

namespace FlowForge.Application.Features.WorkItems.Rename;

public sealed class RenameWorkItemCommandHandler
    : IRequestHandler<RenameWorkItemCommand, ApiResponse<RenameWorkItemResponse>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly WorkItemRules _rules;

    public RenameWorkItemCommandHandler(IApplicationDbContext context, ICurrentUserService currentUser, WorkItemRules rules)
    {
        _context = context;
        _currentUser = currentUser;
        _rules = rules;
    }

    public async Task<ApiResponse<RenameWorkItemResponse>> Handle(RenameWorkItemCommand request, CancellationToken cancellationToken)
    {
        var workItem = await _rules.GetByIdAsync(request.WorkItemId, _currentUser.User.OrganizationId, cancellationToken);

        _rules.EnsureNotArchived(workItem);

        await _rules.EnsureTitleUniqueAsync(workItem.ColumnId, request.Title, workItem.Id, cancellationToken);

        workItem.Rename(request.Title);

        await _context.SaveChangesAsync(cancellationToken);

        return ApiResponse<RenameWorkItemResponse>.SuccessResponse(
            new RenameWorkItemResponse
            {
                Id = workItem.Id,
                Title = workItem.Title,
            },
            "Work Item renamed successfully.");
    }
}