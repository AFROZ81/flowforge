using System.Linq.Expressions;

using FlowForge.Application.Common.Responses;
using FlowForge.Application.Features.Reports.AssigneeSummary;
using FlowForge.Application.Features.Reports.ProductivityTrends;
using FlowForge.Application.Interfaces;
using FlowForge.Application.Services.Authentication;
using FlowForge.Domain.Common.Enums;
using FlowForge.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FlowForge.Application.Features.Dashboard.GetSnapshot;

/// <summary>
/// Builds the whole dashboard in a handful of database round-trips.
///
/// The endpoint it replaces issued six HTTP calls, and its overview handler
/// alone ran eight separate COUNT queries over the same rows. Grouping once per
/// dimension gives the same numbers from one pass each.
///
/// The visibility predicate and the <c>now</c> comparison are copied from the
/// handlers being retired rather than re-derived, so a figure cannot quietly
/// change meaning while the page around it is redesigned.
/// </summary>
public sealed class GetDashboardSnapshotQueryHandler
    : IRequestHandler<GetDashboardSnapshotQuery, ApiResponse<DashboardSnapshot>>
{
    private const int MyOpenItemsCap = 100;
    private const int ProjectHealthCap = 8;
    private const int TeamWorkloadCap = 6;
    private const int RecentlyUpdatedCap = 8;
    private const int ThroughputDays = 14;

    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly IMediator _mediator;

    public GetDashboardSnapshotQueryHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser,
        IMediator mediator)
    {
        _context = context;
        _currentUser = currentUser;
        _mediator = mediator;
    }

    public async Task<ApiResponse<DashboardSnapshot>> Handle(
        GetDashboardSnapshotQuery request,
        CancellationToken cancellationToken)
    {
        var actor = _currentUser.User;
        var organizationId = actor.OrganizationId;
        var userId = actor.UserId;

        var now = DateTime.UtcNow;
        var weekLimit = now.AddDays(7);

        var visible = _context.WorkItems
            .AsNoTracking()
            .Where(VisibleIn(organizationId));

        // ---- 1. workspace status mix: one grouped pass instead of five counts ----

        var workspaceGroups = await visible
            .GroupBy(x => x.Status)
            .Select(g => new StatusCount(
                g.Key,
                g.Count(),
                g.Count(x => x.DueDate != null && x.DueDate < now)))
            .ToListAsync(cancellationToken);

        var statusMix = new StatusMix
        {
            Total = workspaceGroups.Sum(x => x.Count),
            Active = SumFor(workspaceGroups, WorkItemStatus.Active),
            Completed = SumFor(workspaceGroups, WorkItemStatus.Completed),
            Blocked = SumFor(workspaceGroups, WorkItemStatus.Blocked),

            // The retired handler never counted a completed item as overdue.
            // Grouping by status puts that exclusion here rather than in SQL.
            Overdue = workspaceGroups
                .Where(x => x.Status != WorkItemStatus.Completed)
                .Sum(x => x.Overdue)
        };

        // ---- 1b. open work by priority, the dimension the status mix cannot see ----

        var priorityGroups = await visible
            .Where(x => x.Status != WorkItemStatus.Completed)
            .GroupBy(x => x.Priority)
            .Select(g => new PriorityCount(g.Key, g.Count()))
            .ToListAsync(cancellationToken);

        var priorityMix = new PriorityMix
        {
            Total = priorityGroups.Sum(x => x.Count),
            Low = SumFor(priorityGroups, WorkItemPriority.Low),
            Medium = SumFor(priorityGroups, WorkItemPriority.Medium),
            High = SumFor(priorityGroups, WorkItemPriority.High),
            Critical = SumFor(priorityGroups, WorkItemPriority.Critical)
        };

        // ---- 2. the same shape, scoped to the signed-in user ----

        var myGroups = await visible
            .Where(x =>
                x.AssigneeId == userId &&
                x.Status != WorkItemStatus.Completed)
            .GroupBy(x => x.Status)
            .Select(g => new MyCount(
                g.Key,
                g.Count(),
                g.Count(x => x.DueDate != null && x.DueDate < now),
                g.Count(x =>
                    x.DueDate != null &&
                    x.DueDate >= now &&
                    x.DueDate <= weekLimit)))
            .ToListAsync(cancellationToken);

        var myWork = new MyWorkSummary
        {
            Open = myGroups.Sum(x => x.Count),
            Overdue = myGroups.Sum(x => x.Overdue),
            DueSoon = myGroups.Sum(x => x.DueSoon),
            Blocked = SumFor(myGroups, WorkItemStatus.Blocked)
        };

        // ---- 3. the list those figures count ----

        var myOpenItems = await visible
            .Where(x =>
                x.AssigneeId == userId &&
                x.Status != WorkItemStatus.Completed)
            // Undated work last, then the nearest deadline, then the loudest.
            .OrderBy(x => x.DueDate == null)
            .ThenBy(x => x.DueDate)
            .ThenByDescending(x => x.Priority)
            .Take(MyOpenItemsCap)
            .Select(x => new WorkItemBrief
            {
                Id = x.Id,
                Title = x.Title,
                Status = x.Status.ToString(),
                Priority = x.Priority.ToString(),
                DueDate = x.DueDate,
                ProjectId = x.Column.Board.Project.Id,
                ProjectName = x.Column.Board.Project.Name,
                ProjectKey = x.Column.Board.Project.Key,
                BoardId = x.Column.Board.Id,
                BoardName = x.Column.Board.Name
            })
            .ToListAsync(cancellationToken);

        // ---- 4. project health, risk first ----

        var projectRows = await _context.Projects
            .AsNoTracking()
            .Where(x =>
                x.OrganizationId == organizationId &&
                !x.IsDeleted &&
                !x.IsArchived)
            .Select(x => new ProjectRow(
                x.Id,
                x.Name,
                x.Key,
                x.Color,
                x.Icon,

                x.Boards
                    .Where(b => !b.IsDeleted && !b.IsArchived)
                    .SelectMany(b => b.Columns)
                    .Where(c => !c.IsDeleted && !c.IsArchived)
                    .SelectMany(c => c.WorkItems)
                    .Count(w => !w.IsDeleted && !w.IsArchived),

                x.Boards
                    .Where(b => !b.IsDeleted && !b.IsArchived)
                    .SelectMany(b => b.Columns)
                    .Where(c => !c.IsDeleted && !c.IsArchived)
                    .SelectMany(c => c.WorkItems)
                    .Count(w =>
                        !w.IsDeleted &&
                        !w.IsArchived &&
                        w.Status == WorkItemStatus.Completed),

                x.Boards
                    .Where(b => !b.IsDeleted && !b.IsArchived)
                    .SelectMany(b => b.Columns)
                    .Where(c => !c.IsDeleted && !c.IsArchived)
                    .SelectMany(c => c.WorkItems)
                    .Count(w =>
                        !w.IsDeleted &&
                        !w.IsArchived &&
                        w.Status == WorkItemStatus.Blocked),

                x.Boards
                    .Where(b => !b.IsDeleted && !b.IsArchived)
                    .SelectMany(b => b.Columns)
                    .Where(c => !c.IsDeleted && !c.IsArchived)
                    .SelectMany(c => c.WorkItems)
                    .Count(w =>
                        !w.IsDeleted &&
                        !w.IsArchived &&
                        w.DueDate.HasValue &&
                        w.DueDate.Value < now &&
                        w.Status != WorkItemStatus.Completed)))
            .ToListAsync(cancellationToken);

        var riskiestProjects = projectRows
            .OrderByDescending(x => x.Overdue)
            .ThenByDescending(x => x.Blocked)
            .ThenByDescending(x => x.Total)
            .ThenBy(x => x.Name, StringComparer.OrdinalIgnoreCase)
            .Take(ProjectHealthCap)
            .Select(x => new ProjectHealth
            {
                ProjectId = x.Id,
                ProjectName = x.Name,
                ProjectKey = x.Key,
                Color = x.Color,
                Icon = x.Icon,
                Total = x.Total,
                Completed = x.Completed,
                Blocked = x.Blocked,
                Overdue = x.Overdue,
                CompletionPercentage = x.Total == 0
                    ? 0m
                    : Math.Round((decimal)x.Completed / x.Total * 100m, 2)
            })
            .ToList();

        // ---- 5 and 6. portfolio measures Reports already computes ----
        //
        // Sent through the bus rather than re-implemented here: two copies of the
        // same grouping is how the dashboard and the reports page start disagreeing
        // about one number.

        var workload = await _mediator.Send(
            new GetAssigneeSummaryQuery(),
            cancellationToken);

        var trends = await _mediator.Send(
            new GetProductivityTrendsQuery { Days = ThroughputDays },
            cancellationToken);

        var teamWorkload = (workload.Data ?? [])
            .OrderByDescending(x => x.Assigned)
            .ThenBy(x => x.FullName, StringComparer.OrdinalIgnoreCase)
            .Take(TeamWorkloadCap)
            .Select(x => new WorkloadMember
            {
                UserId = x.UserId,
                FullName = x.FullName,
                Assigned = x.Assigned,
                Active = x.Active,
                Completed = x.Completed,
                Blocked = x.Blocked,
                Overdue = x.Overdue
            })
            .ToList();

        var throughput = (trends.Data ?? [])
            .Select(x => new TrendPoint
            {
                Date = x.Date,
                Created = x.Created,
                Completed = x.Completed
            })
            .ToList();

        // ---- 7. recent movement across the workspace ----

        var recentlyUpdated = await visible
            .OrderByDescending(x => x.UpdatedAt ?? x.CreatedAt)
            .Take(RecentlyUpdatedCap)
            .Select(x => new WorkItemBrief
            {
                Id = x.Id,
                Title = x.Title,
                Status = x.Status.ToString(),
                Priority = x.Priority.ToString(),
                DueDate = x.DueDate,
                ProjectId = x.Column.Board.Project.Id,
                ProjectName = x.Column.Board.Project.Name,
                ProjectKey = x.Column.Board.Project.Key,
                BoardId = x.Column.Board.Id,
                BoardName = x.Column.Board.Name,
                LastActivityAt = x.UpdatedAt ?? x.CreatedAt
            })
            .ToListAsync(cancellationToken);

        return ApiResponse<DashboardSnapshot>.SuccessResponse(
            new DashboardSnapshot
            {
                MyWork = myWork,
                MyOpenItems = myOpenItems,
                ProjectHealth = riskiestProjects,
                ProjectCount = projectRows.Count,
                TeamWorkload = teamWorkload,
                StatusMix = statusMix,
                PriorityMix = priorityMix,
                Throughput = throughput,
                RecentlyUpdated = recentlyUpdated,
                GeneratedAtUtc = now
            },
            "Dashboard snapshot retrieved successfully.");
    }

    /// <summary>
    /// What a member may see: their own organization, with nothing archived or
    /// deleted anywhere up the project / board / column chain.
    /// </summary>
    private static Expression<Func<WorkItem, bool>> VisibleIn(Guid organizationId) =>
        x =>
            x.Column.Board.Project.OrganizationId == organizationId &&

            !x.Column.Board.Project.IsDeleted &&
            !x.Column.Board.Project.IsArchived &&

            !x.Column.Board.IsDeleted &&
            !x.Column.Board.IsArchived &&

            !x.Column.IsDeleted &&
            !x.Column.IsArchived &&

            !x.IsDeleted &&
            !x.IsArchived;

    private static int SumFor(IEnumerable<StatusCount> groups, WorkItemStatus status) =>
        groups.Where(x => x.Status == status).Sum(x => x.Count);

    private static int SumFor(IEnumerable<MyCount> groups, WorkItemStatus status) =>
        groups.Where(x => x.Status == status).Sum(x => x.Count);

    private static int SumFor(
        IEnumerable<PriorityCount> groups,
        WorkItemPriority priority) =>
        groups.Where(x => x.Priority == priority).Sum(x => x.Count);

    /// <summary>Intermediate shapes for the grouped aggregates.</summary>
    private sealed record StatusCount(
        WorkItemStatus Status,
        int Count,
        int Overdue);

    private sealed record MyCount(
        WorkItemStatus Status,
        int Count,
        int Overdue,
        int DueSoon);

    private sealed record PriorityCount(WorkItemPriority Priority, int Count);

    private sealed record ProjectRow(
        Guid Id,
        string Name,
        string Key,
        string Color,
        string? Icon,
        int Total,
        int Completed,
        int Blocked,
        int Overdue);
}
