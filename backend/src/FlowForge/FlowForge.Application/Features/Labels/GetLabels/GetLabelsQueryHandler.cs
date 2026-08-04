using FlowForge.Application.Common.Responses;
using FlowForge.Application.Interfaces;
using FlowForge.Application.Services.Authentication;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FlowForge.Application.Features.Labels.GetLabels;

public sealed class GetLabelsQueryHandler : IRequestHandler<GetLabelsQuery, ApiResponse<List<GetLabelsResponse>>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public GetLabelsQueryHandler(IApplicationDbContext context, ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<ApiResponse<List<GetLabelsResponse>>> Handle(GetLabelsQuery request, CancellationToken cancellationToken)
    {
        var currentUser = _currentUser.User;

        var labels = await _context.Labels
            .AsNoTracking()
            .Where(x =>
                x.OrganizationId == currentUser.OrganizationId &&
                !x.IsDeleted)
            .OrderBy(x => x.Name)
            .Select(x => new GetLabelsResponse
            {
                Id = x.Id,
                OrganizationId = x.OrganizationId,
                Name = x.Name,
                Color = x.Color,
                Description = x.Description,
                CreatedAt = x.CreatedAt,
                UpdatedAt = x.UpdatedAt
            })
            .ToListAsync(cancellationToken);

        return ApiResponse<List<GetLabelsResponse>>.SuccessResponse(labels, "Labels retrieved successfully.");
    }
}