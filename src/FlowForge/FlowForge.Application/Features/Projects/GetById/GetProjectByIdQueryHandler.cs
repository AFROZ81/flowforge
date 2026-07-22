using FlowForge.Application.Common.Exceptions;
using FlowForge.Application.Common.Responses;
using FlowForge.Application.Interfaces;
using FlowForge.Application.Services.Authentication;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FlowForge.Application.Features.Projects.GetById;

public sealed class GetProjectByIdQueryHandler
    : IRequestHandler<GetProjectByIdQuery, ApiResponse<GetProjectByIdResponse>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public GetProjectByIdQueryHandler(IApplicationDbContext context, ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<ApiResponse<GetProjectByIdResponse>> Handle(GetProjectByIdQuery request, CancellationToken cancellationToken)
    {
        var project = await _context.Projects
            .AsNoTracking()
            .Where(x =>
                x.Id == request.Id &&
                x.OrganizationId == _currentUser.User.OrganizationId)
            .Select(x => new GetProjectByIdResponse
            {
                Id = x.Id,
                Name = x.Name,
                Key = x.Key,
                Description = x.Description,
                Color = x.Color,
                Icon = x.Icon,
                IsArchived = x.IsArchived
            })
            .FirstOrDefaultAsync(cancellationToken);

        if (project is null)
            throw new NotFoundException("Project not found.");

        return ApiResponse<GetProjectByIdResponse>.SuccessResponse(project, "Project retrieved successfully.");
    }
}