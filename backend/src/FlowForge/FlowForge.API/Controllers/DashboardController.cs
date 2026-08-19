using FlowForge.Application.Features.Dashboard.GetOverview;
using FlowForge.Application.Features.Dashboard.GetWorkItemDistribution;
using FlowForge.Application.Features.Dashboard.GetProjectProgress;
using FlowForge.Application.Features.Dashboard.GetDueWorkItems;
using FlowForge.Application.Features.Dashboard.GetRecentWorkItems;
using FlowForge.Application.Features.Dashboard.GetWorkItemTrend;

using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FlowForge.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public sealed class DashboardController : ControllerBase
{
    private readonly IMediator _mediator;

    public DashboardController(IMediator mediator)
    {
        _mediator = mediator;
    }

    #region Queries

    [HttpGet("overview")]
    public async Task<IActionResult> GetOverview(
        CancellationToken cancellationToken)
    {
        var response =
            await _mediator.Send(
                new GetDashboardOverviewQuery(),
                cancellationToken);

        return Ok(response);
    }

    [HttpGet("work-item-distribution")]
    public async Task<IActionResult> GetWorkItemDistribution(
        CancellationToken cancellationToken)
    {
        var response =
            await _mediator.Send(
                new GetWorkItemDistributionQuery(),
                cancellationToken);

        return Ok(response);
    }

    [HttpGet("project-progress")]
    public async Task<IActionResult> GetProjectProgress(
        CancellationToken cancellationToken)
    {
        var response =
            await _mediator.Send(
                new GetProjectProgressQuery(),
                cancellationToken);

        return Ok(response);
    }

    [HttpGet("due-work-items")]
    public async Task<IActionResult> GetDueWorkItems(
        CancellationToken cancellationToken)
    {
        var response =
            await _mediator.Send(
                new GetDueWorkItemsQuery(),
                cancellationToken);

        return Ok(response);
    }

    [HttpGet("recent-work-items")]
    public async Task<IActionResult> GetRecentWorkItems(
        CancellationToken cancellationToken)
    {
        var response =
            await _mediator.Send(
                new GetRecentWorkItemsQuery(),
                cancellationToken);

        return Ok(response);
    }

    [HttpGet("work-item-trend")]
    public async Task<IActionResult> GetWorkItemTrend(
        [FromQuery] int days = 7,
        CancellationToken cancellationToken = default)
    {
        var response =
            await _mediator.Send(
                new GetWorkItemTrendQuery
                {
                    Days = days
                },
                cancellationToken);

        return Ok(response);
    }

    #endregion
}