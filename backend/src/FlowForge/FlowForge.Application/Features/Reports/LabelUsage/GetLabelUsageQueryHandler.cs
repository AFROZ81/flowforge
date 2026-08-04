using FlowForge.Application.Common.Responses;
using FlowForge.Application.Interfaces;
using FlowForge.Application.Services.Authentication;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FlowForge.Application.Features.Reports.LabelUsage;

public sealed class GetLabelUsageQueryHandler : IRequestHandler<GetLabelUsageQuery, ApiResponse<List<GetLabelUsageResponse>>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public GetLabelUsageQueryHandler(IApplicationDbContext context, ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<ApiResponse<List<GetLabelUsageResponse>>>
        Handle(
            GetLabelUsageQuery request,
            CancellationToken cancellationToken)
    {
        var organizationId = _currentUser.User.OrganizationId;

        var response = await _context.Labels
            .AsNoTracking()
            .Where(x =>
                !x.IsDeleted &&
                x.OrganizationId == organizationId)
            .Select(x => new GetLabelUsageResponse
            {
                LabelId = x.Id,
                Name = x.Name,
                Color = x.Color,

                UsageCount = x.WorkItemLabels.Count(w =>
                    !w.IsDeleted)
            })
            .OrderByDescending(x => x.UsageCount)
            .ThenBy(x => x.Name)
            .ToListAsync(cancellationToken);

        return ApiResponse<List<GetLabelUsageResponse>>.SuccessResponse(response, "Label usage retrieved successfully.");
    }
}