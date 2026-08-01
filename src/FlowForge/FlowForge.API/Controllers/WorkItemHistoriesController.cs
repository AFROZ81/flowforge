using FlowForge.Application.Features.WorkItemHistories.Get;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FlowForge.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public sealed class WorkItemHistoriesController : ControllerBase
{
    private readonly IMediator _mediator;

    public WorkItemHistoriesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("{workItemId:guid}")]
    public async Task<IActionResult> Get(Guid workItemId, CancellationToken cancellationToken)
    {
        var response = await _mediator.Send(
            new GetWorkItemHistoryQuery
            {
                WorkItemId = workItemId
            },
            cancellationToken);

        return Ok(response);
    }
}