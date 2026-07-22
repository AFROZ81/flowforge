using FlowForge.Application.Features.Boards.Create;
using FlowForge.Application.Features.Boards.GetBoards;
using FlowForge.Application.Features.Boards.GetBoardById;
using FlowForge.Application.Features.Boards.Update;
using FlowForge.Application.Features.Boards.Archive;
using FlowForge.Application.Features.Boards.Restore;

using MediatR;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FlowForge.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public sealed class BoardsController : ControllerBase
{
    private readonly IMediator _mediator;

    public BoardsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateBoardCommand command, CancellationToken cancellationToken)
    {
        var response = await _mediator.Send(command, cancellationToken);

        return Ok(response);
    }

    [HttpGet]
    public async Task<IActionResult> GetBoards([FromQuery] GetBoardsQuery query, CancellationToken cancellationToken)
    {
        var response = await _mediator.Send(query, cancellationToken);

        return Ok(response);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
    {
        var response = await _mediator.Send(
            new GetBoardByIdQuery
            {
                BoardId = id
            },
            cancellationToken);

        return Ok(response);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, UpdateBoardCommand command, CancellationToken cancellationToken)
    {
        if (id != command.BoardId)
        {
            return BadRequest("Route ID and Board ID must match.");
        }

        var response = await _mediator.Send(command, cancellationToken);

        return Ok(response);
    }

    [HttpPatch("{id:guid}/archive")]
    public async Task<IActionResult> Archive(Guid id, CancellationToken cancellationToken)
    {
        var response = await _mediator.Send(
            new ArchiveBoardCommand
            {
                BoardId = id
            },
            cancellationToken);

        return Ok(response);
    }

    [HttpPatch("{id:guid}/restore")]
    public async Task<IActionResult> Restore(Guid id, CancellationToken cancellationToken)
    {
        var response = await _mediator.Send(
            new RestoreBoardCommand
            {
                BoardId = id
            },
            cancellationToken);

        return Ok(response);
    }
}