using FlowForge.Application.Features.Checklists.Create;
using FlowForge.Application.Features.Checklists.Get;
using FlowForge.Application.Features.Checklists.Update;
using FlowForge.Application.Features.Checklists.Complete;
using FlowForge.Application.Features.Checklists.Uncomplete;
using FlowForge.Application.Features.Checklists.Delete;
using FlowForge.Application.Features.Checklists.Reorder;
using FlowForge.Application.Features.Checklists.Progress;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FlowForge.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public sealed class ChecklistsController : ControllerBase
{
    private readonly IMediator _mediator;

    public ChecklistsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateChecklistItemCommand command, CancellationToken cancellationToken)
    {
        var response = await _mediator.Send(command, cancellationToken);

        return Ok(response);
    }

    [HttpGet("{workItemId:guid}")]
    public async Task<IActionResult> Get(Guid workItemId, CancellationToken cancellationToken)
    {
        var response = await _mediator.Send(
            new GetChecklistQuery
            {
                WorkItemId = workItemId
            },
            cancellationToken);

        return Ok(response);
    }

    [HttpPut("{checklistItemId:guid}")]
    public async Task<IActionResult> Update(Guid checklistItemId, UpdateChecklistItemCommand command, CancellationToken cancellationToken)
    {
        command = command with
        {
            ChecklistItemId = checklistItemId
        };

        var response = await _mediator.Send(command, cancellationToken);

        return Ok(response);
    }

    [HttpPatch("{checklistItemId:guid}/complete")]
    public async Task<IActionResult> Complete(Guid checklistItemId, CancellationToken cancellationToken)
    {
        var response = await _mediator.Send(
            new CompleteChecklistItemCommand
            {
                ChecklistItemId = checklistItemId
            },
            cancellationToken);

        return Ok(response);
    }

    [HttpPatch("{checklistItemId:guid}/uncomplete")]
    public async Task<IActionResult> Uncomplete(Guid checklistItemId, CancellationToken cancellationToken)
    {
        var response = await _mediator.Send(
            new UncompleteChecklistItemCommand
            {
                ChecklistItemId = checklistItemId
            },
            cancellationToken);

        return Ok(response);
    }

    [HttpDelete("{checklistItemId:guid}")]
    public async Task<IActionResult> Delete(Guid checklistItemId, CancellationToken cancellationToken)
    {
        var response = await _mediator.Send(
            new DeleteChecklistItemCommand
            {
                ChecklistItemId = checklistItemId
            },
            cancellationToken);

        return Ok(response);
    }

    [HttpPatch("reorder")]
    public async Task<IActionResult> Reorder(ReorderChecklistCommand command, CancellationToken cancellationToken)
    {
        var response = await _mediator.Send(command, cancellationToken);

        return Ok(response);
    }

    [HttpGet("{workItemId:guid}/progress")]
    public async Task<IActionResult> GetProgress(Guid workItemId, CancellationToken cancellationToken)
    {
        var response = await _mediator.Send(
            new GetChecklistProgressQuery
            {
                WorkItemId = workItemId
            },
            cancellationToken);

        return Ok(response);
    }
}