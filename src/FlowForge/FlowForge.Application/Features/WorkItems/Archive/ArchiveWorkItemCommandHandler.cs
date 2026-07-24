using FlowForge.Application.Common.Responses;
using FlowForge.Application.Interfaces;
using FlowForge.Application.Services.Authentication;
using MediatR;

namespace FlowForge.Application.Features.WorkItems.Archive;

public sealed class ArchiveWorkItemCommandHandler : IRequestHandler<ArchiveWorkItemCommand, ApiResponse<ArchiveWorkItemResponse>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly WorkItemRules _rules;

    public ArchiveWorkItemCommandHandler(IApplicationDbContext context, ICurrentUserService currentUser, WorkItemRules rules)
    {
        _context = context;
        _currentUser = currentUser;
        _rules = rules;
    }

    public async Task<ApiResponse<ArchiveWorkItemResponse>> Handle(ArchiveWorkItemCommand request, CancellationToken cancellationToken)
    {
        var workItem = await _rules.GetByIdAsync(request.WorkItemId, _currentUser.User.OrganizationId, cancellationToken);

        _rules.EnsureNotArchived(workItem);

        workItem.Archive();

        await _context.SaveChangesAsync(cancellationToken);

        return ApiResponse<ArchiveWorkItemResponse>.SuccessResponse(
            new ArchiveWorkItemResponse
            {
                Id = workItem.Id,
                IsArchived = workItem.IsArchived
            },
            "Work Item archived successfully.");
    }
}