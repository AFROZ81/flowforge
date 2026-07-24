using FlowForge.Application.Features.WorkItems.Activate;
using FlowForge.Application.Features.WorkItems.Archive;
using FlowForge.Application.Features.WorkItems.Block;
using FlowForge.Application.Features.WorkItems.Complete;
using FlowForge.Application.Features.WorkItems.Create;
using FlowForge.Application.Features.WorkItems.Edit;
using FlowForge.Application.Features.WorkItems.GetByColumn;
using FlowForge.Application.Features.WorkItems.GetById;
using FlowForge.Application.Features.WorkItems.GetWorkItems;
using FlowForge.Application.Features.WorkItems.Move;
using FlowForge.Application.Features.WorkItems.Rename;
using FlowForge.Application.Features.WorkItems.Restore;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FlowForge.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public sealed class WorkItemsController : ControllerBase
{
    private readonly IMediator _mediator;

    public WorkItemsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    #region Commands

    [HttpPost]
    public async Task<IActionResult> Create(CreateWorkItemCommand command, CancellationToken cancellationToken)
    {
        var response = await _mediator.Send(command, cancellationToken);
        return Ok(response);
    }

    [HttpPatch("{id:guid}/rename")]
    public async Task<IActionResult> Rename(Guid id, RenameWorkItemCommand command, CancellationToken cancellationToken)
    {
        var response = await _mediator.Send(
            command with
            {
                WorkItemId = id
            },
            cancellationToken);

        return Ok(response);
    }

    [HttpPatch("{id:guid}/edit")]
    public async Task<IActionResult> Edit(Guid id, EditWorkItemCommand command, CancellationToken cancellationToken)
    {
        var response = await _mediator.Send(
            command with
            {
                WorkItemId = id
            },
            cancellationToken);

        return Ok(response);
    }

    [HttpPatch("{id:guid}/move")]
    public async Task<IActionResult> Move(Guid id, MoveWorkItemCommand command, CancellationToken cancellationToken)
    {
        var response = await _mediator.Send(
            command with
            {
                WorkItemId = id
            },
            cancellationToken);

        return Ok(response);
    }

    [HttpPatch("{id:guid}/complete")]
    public async Task<IActionResult> Complete(Guid id, CancellationToken cancellationToken)
    {
        var response = await _mediator.Send(
            new CompleteWorkItemCommand
            {
                WorkItemId = id
            },
            cancellationToken);

        return Ok(response);
    }

    [HttpPatch("{id:guid}/block")]
    public async Task<IActionResult> Block(Guid id, CancellationToken cancellationToken)
    {
        var response = await _mediator.Send(
            new BlockWorkItemCommand
            {
                WorkItemId = id
            },
            cancellationToken);

        return Ok(response);
    }

    [HttpPatch("{id:guid}/activate")]
    public async Task<IActionResult> Activate(Guid id, CancellationToken cancellationToken)
    {
        var response = await _mediator.Send(
            new ActivateWorkItemCommand
            {
                WorkItemId = id
            },
            cancellationToken);

        return Ok(response);
    }

    [HttpPatch("{id:guid}/archive")]
    public async Task<IActionResult> Archive(Guid id, CancellationToken cancellationToken)
    {
        var response = await _mediator.Send(
            new ArchiveWorkItemCommand
            {
                WorkItemId = id
            },
            cancellationToken);

        return Ok(response);
    }

    [HttpPatch("{id:guid}/restore")]
    public async Task<IActionResult> Restore(Guid id, CancellationToken cancellationToken)
    {
        var response = await _mediator.Send(
            new RestoreWorkItemCommand
            {
                WorkItemId = id
            },
            cancellationToken);

        return Ok(response);
    }

    #endregion

    #region Queries

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
    {
        var response = await _mediator.Send(
            new GetWorkItemByIdQuery
            {
                Id = id
            },
            cancellationToken);

        return Ok(response);
    }

    [HttpGet("column/{columnId:guid}")]
    public async Task<IActionResult> GetByColumn(Guid columnId, [FromQuery] bool includeArchived, CancellationToken cancellationToken)
    {
        var response = await _mediator.Send(
            new GetWorkItemsByColumnQuery
            {
                ColumnId = columnId,
                IncludeArchived = includeArchived
            },
            cancellationToken);

        return Ok(response);
    }

    [HttpGet]
    public async Task<IActionResult> GetWorkItems([FromQuery] GetWorkItemsQuery query, CancellationToken cancellationToken)
    {
        var response = await _mediator.Send(query, cancellationToken);
        return Ok(response);
    }

    #endregion
}