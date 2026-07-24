using FlowForge.Application.Common.Exceptions;
using FlowForge.Application.Common.Responses;
using FlowForge.Application.Interfaces;
using FlowForge.Application.Services.Authentication;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FlowForge.Application.Features.WorkItems.GetById;

public sealed class GetWorkItemByIdQueryHandler : IRequestHandler<GetWorkItemByIdQuery, ApiResponse<GetWorkItemByIdResponse>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public GetWorkItemByIdQueryHandler(IApplicationDbContext context, ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<ApiResponse<GetWorkItemByIdResponse>> Handle(GetWorkItemByIdQuery request, CancellationToken cancellationToken)
    {
        var response = await _context.WorkItems
            .AsNoTracking()
            .Where(x =>
                x.Id == request.Id &&
                !x.IsDeleted &&
                x.Column.Board.Project.OrganizationId == _currentUser.User.OrganizationId)
            .Select(x => new GetWorkItemByIdResponse
            {
                Id = x.Id,
                ColumnId = x.ColumnId,
                Title = x.Title,
                Description = x.Description,
                Priority = x.Priority,
                Status = x.Status,
                DisplayOrder = x.DisplayOrder,
                DueDate = x.DueDate,
                IsArchived = x.IsArchived
            })
            .FirstOrDefaultAsync(cancellationToken);

        if (response is null)
        {
            throw new NotFoundException("Work Item not found.");
        }

        return ApiResponse<GetWorkItemByIdResponse>.SuccessResponse(response, "Work Item retrieved successfully.");
    }
}