using FlowForge.Application.Common.Responses;
using FlowForge.Application.Interfaces;
using FlowForge.Application.Services.Authentication;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FlowForge.Application.Features.Notifications.GetMyNotifications;

public sealed class GetMyNotificationsQueryHandler : IRequestHandler<GetMyNotificationsQuery, ApiResponse<List<GetMyNotificationsResponse>>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public GetMyNotificationsQueryHandler(IApplicationDbContext context, ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<ApiResponse<List<GetMyNotificationsResponse>>> Handle(GetMyNotificationsQuery request, CancellationToken cancellationToken)
    {
        var currentUser = _currentUser.User;

        var notifications = await _context.Notifications
            .AsNoTracking()
            .Where(x =>
                x.OrganizationId == currentUser.OrganizationId &&
                x.RecipientId == currentUser.UserId &&
                !x.IsDeleted)
            .OrderByDescending(x => x.CreatedAt)
            .Select(x => new GetMyNotificationsResponse
            {
                Id = x.Id,
                Type = x.Type.ToString(),
                Title = x.Title,
                Message = x.Message,
                WorkItemId = x.WorkItemId,
                IsRead = x.IsRead,
                ReadAt = x.ReadAt,
                CreatedAt = x.CreatedAt
            })
            .ToListAsync(cancellationToken);

        return ApiResponse<List<GetMyNotificationsResponse>>.SuccessResponse(notifications, "Notifications retrieved successfully.");
    }
}