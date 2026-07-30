using FlowForge.Application.Features.Comments.Create;
using FlowForge.Application.Features.Comments.GetCommentById;
using FlowForge.Application.Features.Comments.Update;
using FlowForge.Application.Features.Comments.Delete;
using FlowForge.Application.Features.Comments.GetCommentsByWorkItem;

using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FlowForge.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public sealed class CommentsController : ControllerBase
{
    private readonly IMediator _mediator;

    public CommentsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    #region Commands

    [HttpPost]
    public async Task<IActionResult> Create(CreateCommentCommand command, CancellationToken cancellationToken)
    {
        var response = await _mediator.Send(command, cancellationToken);

        return Ok(response);
    }

    #endregion

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
    {
        var response = await _mediator.Send(
            new GetCommentByIdQuery
            {
                Id = id
            },
            cancellationToken);

        return Ok(response);
    }

    [HttpPatch("{id:guid}/update")]
    public async Task<IActionResult> Update(Guid id, UpdateCommentCommand command, CancellationToken cancellationToken)
    {
        var response = await _mediator.Send(
            command with
            {
                CommentId = id
            },
            cancellationToken);

        return Ok(response);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var response = await _mediator.Send(
            new DeleteCommentCommand
            {
                CommentId = id
            },
            cancellationToken);

        return Ok(response);
    }

    [HttpGet("workitem/{workItemId:guid}")]
    public async Task<IActionResult> GetByWorkItem(Guid workItemId, CancellationToken cancellationToken)
    {
        var response = await _mediator.Send(
            new GetCommentsByWorkItemQuery
            {
                WorkItemId = workItemId
            },
            cancellationToken);

        return Ok(response);
    }
}