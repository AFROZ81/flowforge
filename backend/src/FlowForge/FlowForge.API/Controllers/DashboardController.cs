using FlowForge.Application.Common.Responses;
using FlowForge.Application.Features.Dashboard.GetSnapshot;

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

    /// <summary>
    /// The dashboard in one call.
    ///
    /// This used to be six endpoints the page fanned out on mount, none of which
    /// answered the question a dashboard is actually for: what should I look at
    /// right now. One snapshot also means one loading state, one error state and
    /// one timestamp, so the figures on screen are known to describe the same
    /// moment.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<DashboardSnapshot>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetSnapshot(
        CancellationToken cancellationToken)
    {
        var response = await _mediator.Send(
            new GetDashboardSnapshotQuery(),
            cancellationToken);

        return Ok(response);
    }
}
