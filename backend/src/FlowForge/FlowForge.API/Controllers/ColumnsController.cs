using FlowForge.Application.Features.Columns.Archive;
using FlowForge.Application.Features.Columns.Create;
using FlowForge.Application.Features.Columns.GetById;
using FlowForge.Application.Features.Columns.GetColumns;
using FlowForge.Application.Features.Columns.Restore;
using FlowForge.Application.Features.Columns.Update;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FlowForge.API.Controllers;

[Authorize(Policy = "RequireViewer")]
[ApiController]
[Route("api/[controller]")]
public sealed class ColumnsController : ControllerBase
{
    private readonly IMediator _mediator;

    public ColumnsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost]
    [Authorize(Policy = "RequireMember")]
    public async Task<IActionResult> Create(CreateColumnCommand command, CancellationToken cancellationToken)
    {
        var response = await _mediator.Send(command, cancellationToken);

        return Ok(response);
    }

    [HttpGet]
    public async Task<IActionResult> GetColumns([FromQuery] GetColumnsQuery query, CancellationToken cancellationToken)
    {
        var response = await _mediator.Send(query, cancellationToken);

        return Ok(response);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
    {
        var response = await _mediator.Send(
            new GetColumnByIdQuery
            {
                Id = id
            },
            cancellationToken);

        return Ok(response);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Policy = "RequireMember")]
    public async Task<IActionResult> Update(Guid id, UpdateColumnCommand command, CancellationToken cancellationToken)
    {
        if (id != command.Id)
        {
            return BadRequest("Route ID and Column ID must match.");
        }

        var response = await _mediator.Send(command, cancellationToken);

        return Ok(response);
    }

    [HttpPatch("{id:guid}/archive")]
    [Authorize(Policy = "RequireAdmin")]
    public async Task<IActionResult> Archive(Guid id, CancellationToken cancellationToken)
    {
        var response = await _mediator.Send(
            new ArchiveColumnCommand
            {
                Id = id
            },
            cancellationToken);

        return Ok(response);
    }

    [HttpPatch("{id:guid}/restore")]
    [Authorize(Policy = "RequireAdmin")]
    public async Task<IActionResult> Restore(Guid id, CancellationToken cancellationToken)
    {
        var response = await _mediator.Send(
            new RestoreColumnCommand
            {
                Id = id
            },
            cancellationToken);

        return Ok(response);
    }
}