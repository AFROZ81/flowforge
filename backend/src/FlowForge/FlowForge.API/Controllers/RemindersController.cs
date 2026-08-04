using FlowForge.Application.Features.Reminders.Set;
using FlowForge.Application.Features.Reminders.Upcoming;
using FlowForge.Application.Features.Reminders.Overdue;
using FlowForge.Application.Features.Reminders.Remove;

using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FlowForge.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public sealed class RemindersController : ControllerBase
{
    private readonly IMediator _mediator;

    public RemindersController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPatch]
    public async Task<IActionResult> SetReminder(SetReminderCommand command, CancellationToken cancellationToken)
    {
        var response = await _mediator.Send(command, cancellationToken);

        return Ok(response);
    }

    [HttpGet("upcoming")]
    public async Task<IActionResult> Upcoming([FromQuery] GetUpcomingRemindersQuery query, CancellationToken cancellationToken)
    {
        return Ok(await _mediator.Send(query, cancellationToken));
    }

    [HttpGet("overdue")]
    public async Task<IActionResult> Overdue(CancellationToken cancellationToken)
    {
        return Ok(await _mediator.Send(new GetOverdueWorkItemsQuery(), cancellationToken));
    }

    [HttpDelete("{workItemId:guid}")]
    public async Task<IActionResult> RemoveReminder(Guid workItemId, CancellationToken cancellationToken)
    {
        var response = await _mediator.Send(
            new RemoveReminderCommand
            {
                WorkItemId = workItemId
            },
            cancellationToken);

        return Ok(response);
    }
}