using FlowForge.Application.Common.Responses;
using FlowForge.Application.Interfaces;
using FlowForge.Application.Services.Authentication;
using FlowForge.Domain.Entities;
using MediatR;

namespace FlowForge.Application.Features.Checklists.Create;

public sealed class CreateChecklistItemCommandHandler : IRequestHandler<CreateChecklistItemCommand, ApiResponse<CreateChecklistItemResponse>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly ChecklistRules _rules;

    public CreateChecklistItemCommandHandler(IApplicationDbContext context, ICurrentUserService currentUser, ChecklistRules rules)
    {
        _context = context;
        _currentUser = currentUser;
        _rules = rules;
    }

    public async Task<ApiResponse<CreateChecklistItemResponse>> Handle(CreateChecklistItemCommand request, CancellationToken cancellationToken)
    {
        var currentUser = _currentUser.User;

        var workItem = await _rules.GetWorkItemAsync(request.WorkItemId, currentUser.OrganizationId, cancellationToken);

        _rules.EnsureWorkItemNotArchived(workItem);

        var order = await _rules.GetNextOrderAsync(workItem.Id, cancellationToken);

        var checklistItem = new ChecklistItem(workItem.Id, request.Title, order);

        _context.ChecklistItems.Add(checklistItem);

        await _context.SaveChangesAsync(cancellationToken);

        return ApiResponse<CreateChecklistItemResponse>
            .SuccessResponse(
                new CreateChecklistItemResponse
                {
                    Id = checklistItem.Id,
                    WorkItemId = checklistItem.WorkItemId,
                    Title = checklistItem.Title,
                    Order = checklistItem.Order,
                    IsCompleted = checklistItem.IsCompleted,
                    CreatedAt = checklistItem.CreatedAt
                },
                "Checklist item created successfully.");
    }
}