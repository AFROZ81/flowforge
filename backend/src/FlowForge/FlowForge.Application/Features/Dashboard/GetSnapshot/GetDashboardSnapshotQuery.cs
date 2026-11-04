using FlowForge.Application.Common.Responses;
using MediatR;

namespace FlowForge.Application.Features.Dashboard.GetSnapshot;

/// <summary>
/// Everything the dashboard shows, in one answer.
///
/// Replaces six separate dashboard endpoints that the page had to fan out on
/// mount, and adds the one thing none of them offered: a view scoped to the
/// signed-in user rather than to the whole organization.
/// </summary>
public sealed record GetDashboardSnapshotQuery
    : IRequest<ApiResponse<DashboardSnapshot>>;
