using FlowForge.Application.Features.WorkItemWatchers.Create;
using FlowForge.Application.Features.WorkItemWatchers.Get;
using FlowForge.Application.Features.WorkItemWatchers.Delete;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FlowForge.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public sealed class WorkItemWatchersController : ControllerBase
{
    private readonly IMediator _mediator;

    public WorkItemWatchersController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateWorkItemWatcherCommand command, CancellationToken cancellationToken)
    {
        var response = await _mediator.Send(command, cancellationToken);

        return Ok(response);
    }

    [HttpGet("{workItemId:guid}")]
    public async Task<IActionResult> Get(Guid workItemId, CancellationToken cancellationToken)
    {
        var response = await _mediator.Send(
            new GetWorkItemWatchersQuery
            {
                WorkItemId = workItemId
            },
            cancellationToken);

        return Ok(response);
    }

    [HttpDelete("{watcherId:guid}")]
    public async Task<IActionResult> Delete(Guid watcherId, CancellationToken cancellationToken)
    {
        var response = await _mediator.Send(
            new DeleteWorkItemWatcherCommand
            {
                WatcherId = watcherId
            },
            cancellationToken);

        return Ok(response);
    }
}