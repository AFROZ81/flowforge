using FlowForge.Application.Common.Responses;
using FlowForge.Application.Interfaces;
using FlowForge.Application.Services.Authentication;
using FlowForge.Domain.Enums;

using MediatR;

using Microsoft.EntityFrameworkCore;

namespace FlowForge.Application.Features.Dashboard.GetWorkItemTrend;

public sealed class GetWorkItemTrendQueryHandler
    : IRequestHandler<
        GetWorkItemTrendQuery,
        ApiResponse<List<GetWorkItemTrendResponse>>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public GetWorkItemTrendQueryHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<
        ApiResponse<List<GetWorkItemTrendResponse>>>
        Handle(
            GetWorkItemTrendQuery request,
            CancellationToken cancellationToken)
    {
        var currentUser = _currentUser.User;

        /*
         * ---------------------------------------------------------
         * Normalize requested range
         * ---------------------------------------------------------
         */

        var days = request.Days;

        if (days != 7 &&
            days != 30 &&
            days != 90)
        {
            days = 7;
        }

        /*
         * ---------------------------------------------------------
         * Use UTC because EntityBase timestamps are UTC.
         * ---------------------------------------------------------
         */

        var today =
            DateTime.UtcNow.Date;

        var startDate =
            today.AddDays(-(days - 1));

        var endDate =
            today.AddDays(1);

        /*
         * ---------------------------------------------------------
         * Get historical Work Item activity.
         *
         * Action:
         *
         * Created   = 1
         * Completed = 7
         *
         * We intentionally use WorkItemHistory instead of
         * WorkItem.UpdatedAt because UpdatedAt only tells us
         * when the Work Item was last modified.
         * ---------------------------------------------------------
         */

        var history = await _context.WorkItemHistories
            .AsNoTracking()
            .Where(x =>
                x.CreatedAt >= startDate &&
                x.CreatedAt < endDate &&

                !x.IsDeleted &&

                x.WorkItem.Column.Board.Project.OrganizationId ==
                    currentUser.OrganizationId &&

                !x.WorkItem.IsDeleted &&

                !x.WorkItem.Column.IsDeleted &&

                !x.WorkItem.Column.Board.IsDeleted &&

                !x.WorkItem.Column.Board.Project.IsDeleted)
            .Select(x => new
            {
                x.CreatedAt,
                x.Action
            })
            .ToListAsync(cancellationToken);

        /*
         * ---------------------------------------------------------
         * Group database history by date.
         * ---------------------------------------------------------
         */

        var grouped =
            history
                .GroupBy(x => x.CreatedAt.Date)
                .ToDictionary(
                    x => x.Key,
                    x => new
                    {
                        Created =
                            x.Count(h =>
                                h.Action ==
                                WorkItemHistoryAction.Created),

                        Completed =
                            x.Count(h =>
                                h.Action ==
                                WorkItemHistoryAction.Completed)
                    });

        /*
         * ---------------------------------------------------------
         * Always return every day in the requested range.
         *
         * This is important for the frontend chart because
         * missing activity should appear as 0 rather than
         * causing gaps in the graph.
         * ---------------------------------------------------------
         */

        var result =
            new List<GetWorkItemTrendResponse>();

        for (
            var date = startDate;
            date < endDate;
            date = date.AddDays(1))
        {
            if (grouped.TryGetValue(
                    date,
                    out var values))
            {
                result.Add(
                    new GetWorkItemTrendResponse
                    {
                        Date = date,
                        Created = values.Created,
                        Completed = values.Completed
                    });
            }
            else
            {
                result.Add(
                    new GetWorkItemTrendResponse
                    {
                        Date = date,
                        Created = 0,
                        Completed = 0
                    });
            }
        }

        return ApiResponse<
            List<GetWorkItemTrendResponse>>
            .SuccessResponse(
                result,
                "Work Item trend retrieved successfully.");
    }
}