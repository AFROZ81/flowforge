namespace FlowForge.Application.Features.Dashboard.GetSnapshot;

/// <summary>
/// The dashboard's complete payload.
///
/// Status and priority travel as strings because every existing dashboard and
/// board response already renders them that way; sending numbers would make the
/// frontend translate them back for no benefit.
/// </summary>
public sealed class DashboardSnapshot
{
    public required MyWorkSummary MyWork { get; init; }

    public required IReadOnlyList<WorkItemBrief> MyOpenItems { get; init; }

    public required IReadOnlyList<ProjectHealth> ProjectHealth { get; init; }

    /// <summary>Projects in the workspace, including any not shown in the top slice.</summary>
    public int ProjectCount { get; init; }

    public required IReadOnlyList<WorkloadMember> TeamWorkload { get; init; }

    public required StatusMix StatusMix { get; init; }

    public required PriorityMix PriorityMix { get; init; }

    public required IReadOnlyList<TrendPoint> Throughput { get; init; }

    public required IReadOnlyList<WorkItemBrief> RecentlyUpdated { get; init; }

    /// <summary>When this snapshot was built, so the page can say "updated 14:32" truthfully.</summary>
    public DateTime GeneratedAtUtc { get; init; }
}

/// <summary>
/// Counts over the signed-in user's own open work. Nothing here is
/// workspace-wide, which is the point of the section it feeds.
/// </summary>
public sealed class MyWorkSummary
{
    public int Open { get; init; }

    /// <summary>Past its due timestamp and not completed.</summary>
    public int Overdue { get; init; }

    /// <summary>
    /// Still ahead, due within the next seven days. Kept disjoint from Overdue
    /// because due dates are stored at UTC midnight, so the retired dashboard
    /// already counted an item due today as overdue - the two figures must not
    /// silently overlap.
    /// </summary>
    public int DueSoon { get; init; }

    public int Blocked { get; init; }
}

/// <summary>
/// A work item as the dashboard needs it. <paramref name="LastActivityAt"/> is
/// filled only for the recently-updated list; open items sort by due date and
/// have nothing to show there.
/// </summary>
public sealed class WorkItemBrief
{
    public Guid Id { get; init; }

    public string Title { get; init; } = string.Empty;

    public string Status { get; init; } = string.Empty;

    public string Priority { get; init; } = string.Empty;

    public DateTime? DueDate { get; init; }

    public Guid ProjectId { get; init; }

    public string ProjectName { get; init; } = string.Empty;

    public string ProjectKey { get; init; } = string.Empty;

    public Guid BoardId { get; init; }

    public string BoardName { get; init; } = string.Empty;

    public DateTime? LastActivityAt { get; init; }
}

public sealed class ProjectHealth
{
    public Guid ProjectId { get; init; }

    public string ProjectName { get; init; } = string.Empty;

    public string ProjectKey { get; init; } = string.Empty;

    public string Color { get; init; } = string.Empty;

    /// <summary>The emoji chosen at creation, so the dashboard can show the same mark as the project list.</summary>
    public string? Icon { get; init; }

    public int Total { get; init; }

    public int Completed { get; init; }

    public int Blocked { get; init; }

    public int Overdue { get; init; }

    public decimal CompletionPercentage { get; init; }
}

public sealed class WorkloadMember
{
    public Guid UserId { get; init; }

    public string FullName { get; init; } = string.Empty;

    public int Assigned { get; init; }

    public int Active { get; init; }

    public int Completed { get; init; }

    public int Blocked { get; init; }

    public int Overdue { get; init; }
}

/// <summary>Workspace-wide, because a mix of statuses is a portfolio measure.</summary>
public sealed class StatusMix
{
    public int Total { get; init; }

    public int Active { get; init; }

    public int Completed { get; init; }

    public int Blocked { get; init; }

    public int Overdue { get; init; }
}

/// <summary>
/// Workspace-wide, and over open work only.
///
/// Completed items are left out on purpose: once work is done its urgency is
/// history, so counting it would let a Critical slice describe a fire that has
/// already been put out. The four buckets are the whole of
/// <see cref="FlowForge.Domain.Common.Enums.WorkItemPriority"/>, which is why
/// they are named rather than sent as a list - a missing priority must read as
/// a zero, not as an absent category.
/// </summary>
public sealed class PriorityMix
{
    public int Total { get; init; }

    public int Low { get; init; }

    public int Medium { get; init; }

    public int High { get; init; }

    public int Critical { get; init; }
}

public sealed class TrendPoint
{
    public DateOnly Date { get; init; }

    public int Created { get; init; }

    public int Completed { get; init; }
}
