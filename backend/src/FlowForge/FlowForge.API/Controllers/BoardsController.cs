using FlowForge.Application.Features.Boards.Create;
using FlowForge.Application.Features.Boards.Delete;
using FlowForge.Application.Features.Boards.GetBoards;
using FlowForge.Application.Features.Boards.GetBoardById;
using FlowForge.Application.Features.Boards.Update;
using FlowForge.Application.Features.Boards.Archive;
using FlowForge.Application.Features.Boards.Restore;
using FlowForge.Application.Features.Boards.GetBoardDetails;

using MediatR;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FlowForge.API.Controllers;

[Authorize(Policy = "RequireViewer")]
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
    [Authorize(Policy = "RequireAdmin")]
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
    [Authorize(Policy = "RequireAdmin")]
    public async Task<IActionResult> Update(Guid id, UpdateBoardCommand command, CancellationToken cancellationToken)
    {
        if (id != command.BoardId)
        {
            return BadRequest("Route ID and Board ID must match.");
        }

        var response = await _mediator.Send(command, cancellationToken);

        return Ok(response);
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Policy = "RequireAdmin")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        await _mediator.Send(
            new DeleteBoardCommand { BoardId = id },
            cancellationToken);

        return NoContent();
    }

    [HttpPatch("{id:guid}/archive")]
    [Authorize(Policy = "RequireAdmin")]
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
    [Authorize(Policy = "RequireAdmin")]
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

    [HttpGet("{id:guid}/details")]
    public async Task<IActionResult> GetDetails(Guid id)
    {
        var result = await _mediator.Send(new GetBoardDetailsQuery(id));

        return Ok(result);
    }
}