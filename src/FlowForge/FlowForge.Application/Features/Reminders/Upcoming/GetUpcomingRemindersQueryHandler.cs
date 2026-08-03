using FlowForge.Application.Common.Responses;
using FlowForge.Application.Interfaces;
using FlowForge.Application.Services.Authentication;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FlowForge.Application.Features.Reminders.Upcoming;

public sealed class GetUpcomingRemindersQueryHandler : IRequestHandler<GetUpcomingRemindersQuery, ApiResponse<List<GetUpcomingRemindersResponse>>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public GetUpcomingRemindersQueryHandler(IApplicationDbContext context, ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<ApiResponse<List<GetUpcomingRemindersResponse>>> Handle(GetUpcomingRemindersQuery request, CancellationToken cancellationToken)
    {
        var currentUser = _currentUser.User;

        var now = DateTime.UtcNow;
        var until = now.AddDays(request.Days);

        var reminders = await _context.WorkItems
            .AsNoTracking()
            .Include(x => x.Column)
                .ThenInclude(x => x.Board)
                    .ThenInclude(x => x.Project)
            .Where(x =>
                !x.IsDeleted &&
                !x.IsArchived &&
                x.ReminderDate.HasValue &&
                x.ReminderDate >= now &&
                x.ReminderDate <= until &&
                x.Column.Board.Project.OrganizationId ==
                    currentUser.OrganizationId)
            .OrderBy(x => x.ReminderDate)
            .Select(x => new GetUpcomingRemindersResponse
            {
                WorkItemId = x.Id,
                Title = x.Title,
                DueDate = x.DueDate,
                ReminderDate = x.ReminderDate
            })
            .ToListAsync(cancellationToken);

        return ApiResponse<List<GetUpcomingRemindersResponse>>.SuccessResponse(reminders, "Upcoming reminders retrieved successfully.");
    }
}