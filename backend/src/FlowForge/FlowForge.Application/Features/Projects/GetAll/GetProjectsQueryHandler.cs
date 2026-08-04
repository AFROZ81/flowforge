using System.Linq.Expressions;

using FlowForge.Application.Common.Pagination;
using FlowForge.Application.Common.Responses;
using FlowForge.Application.Interfaces;
using FlowForge.Application.Services.Authentication;
using FlowForge.Domain.Entities;

using MediatR;

using Microsoft.EntityFrameworkCore;

namespace FlowForge.Application.Features.Projects.GetAll;

public sealed class GetProjectsQueryHandler : IRequestHandler<GetProjectsQuery, ApiResponse<PagedResponse<ProjectDto>>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    private static readonly Dictionary<string, Expression<Func<Project, object>>> SortExpressions =
        new()
        {
            ["name"] = x => x.Name,
            ["key"] = x => x.Key,
            ["createdat"] = x => x.CreatedAt
        };

    public GetProjectsQueryHandler(IApplicationDbContext context, ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<ApiResponse<PagedResponse<ProjectDto>>> Handle(GetProjectsQuery request, CancellationToken cancellationToken)
    {
        var query = _context.Projects.AsNoTracking().Where(x => x.OrganizationId == _currentUser.User.OrganizationId && !x.IsArchived);

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.Trim();

            query = query.Where(x =>
                x.Name.Contains(search) ||
                x.Key.Contains(search) ||
                (x.Description != null &&
                x.Description.Contains(search)));
        }

        query = query.ApplySorting(
            request.SortBy,
            request.SortDirection.Equals(
                "desc",
                StringComparison.OrdinalIgnoreCase),
            SortExpressions,
            x => x.Name);

        var dtoQuery = query.Select(x => new ProjectDto
        {
            Id = x.Id,
            Name = x.Name,
            Key = x.Key,
            Description = x.Description,
            Color = x.Color,
            Icon = x.Icon
        });

        var pagedProjects = await dtoQuery.ToPagedResponseAsync(request, cancellationToken);

        return ApiResponse<PagedResponse<ProjectDto>>.SuccessResponse(pagedProjects, "Projects retrieved successfully.");
    }
}