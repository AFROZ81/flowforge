using FlowForge.Application.Common.Responses;
using FlowForge.Application.Interfaces;
using FlowForge.Application.Services.Authentication;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FlowForge.Application.Features.Labels.GetLabelsByWorkItem;

public sealed class GetLabelsByWorkItemQueryHandler : IRequestHandler<GetLabelsByWorkItemQuery, ApiResponse<List<GetLabelsByWorkItemResponse>>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly LabelRules _labelRules;

    public GetLabelsByWorkItemQueryHandler(IApplicationDbContext context, ICurrentUserService currentUser, LabelRules labelRules)
    {
        _context = context;
        _currentUser = currentUser;
        _labelRules = labelRules;
    }

    public async Task<ApiResponse<List<GetLabelsByWorkItemResponse>>> Handle(GetLabelsByWorkItemQuery request, CancellationToken cancellationToken)
    {
        var currentUser = _currentUser.User;

        await _labelRules.GetWorkItemAsync(request.WorkItemId, currentUser.OrganizationId, cancellationToken);

        var labels = await _context.WorkItemLabels
            .AsNoTracking()
            .Where(x =>
                x.WorkItemId == request.WorkItemId &&
                !x.IsDeleted &&
                !x.Label.IsDeleted &&
                x.Label.OrganizationId == currentUser.OrganizationId)
            .OrderBy(x => x.Label.Name)
            .Select(x => new GetLabelsByWorkItemResponse
            {
                Id = x.Id,
                LabelId = x.LabelId,
                Name = x.Label.Name,
                Color = x.Label.Color,
                Description = x.Label.Description,
                AssignedAt = x.CreatedAt
            })
            .ToListAsync(cancellationToken);

        return ApiResponse<List<GetLabelsByWorkItemResponse>>
            .SuccessResponse(labels, "Work Item labels retrieved successfully.");
    }
}