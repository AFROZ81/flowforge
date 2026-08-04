using FlowForge.Application.Features.Labels.Create;
using FlowForge.Application.Features.Labels.GetLabelById;
using FlowForge.Application.Features.Labels.GetLabels;
using FlowForge.Application.Features.Labels.Update;
using FlowForge.Application.Features.Labels.Delete;
using FlowForge.Application.Features.Labels.Assign;
using FlowForge.Application.Features.Labels.Remove;
using FlowForge.Application.Features.Labels.GetLabelsByWorkItem;

using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FlowForge.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public sealed class LabelsController : ControllerBase
{
    private readonly IMediator _mediator;

    public LabelsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    #region Commands

    [HttpPost]
    public async Task<IActionResult> Create(CreateLabelCommand command, CancellationToken cancellationToken)
    {
        var response = await _mediator.Send(
            command,
            cancellationToken);

        return Ok(response);
    }

    #endregion

    #region Queries

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
    {
        var response = await _mediator.Send(
            new GetLabelByIdQuery
            {
                Id = id
            },
            cancellationToken);

        return Ok(response);
    }

    #endregion

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var response = await _mediator.Send(new GetLabelsQuery(), cancellationToken);

        return Ok(response);
    }

    [HttpPatch("{id:guid}/update")]
    public async Task<IActionResult> Update(Guid id, UpdateLabelCommand command, CancellationToken cancellationToken)
    {
        var response = await _mediator.Send(
            command with
            {
                LabelId = id
            },
            cancellationToken);

        return Ok(response);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var response = await _mediator.Send(
            new DeleteLabelCommand
            {
                LabelId = id
            },
            cancellationToken);

        return Ok(response);
    }

    [HttpPost("workitem/{workItemId:guid}/label/{labelId:guid}")]
    public async Task<IActionResult> Assign(Guid workItemId, Guid labelId, CancellationToken cancellationToken)
    {
        var response = await _mediator.Send(
            new AssignLabelCommand
            {
                WorkItemId = workItemId,
                LabelId = labelId
            },
            cancellationToken);

        return Ok(response);
    }

    [HttpDelete("workitem/{workItemId:guid}/label/{labelId:guid}")]
    public async Task<IActionResult> Remove(Guid workItemId, Guid labelId, CancellationToken cancellationToken)
    {
        var response = await _mediator.Send(
            new RemoveLabelCommand
            {
                WorkItemId = workItemId,
                LabelId = labelId
            },
            cancellationToken);

        return Ok(response);
    }

    [HttpGet("workitem/{workItemId:guid}")]
    public async Task<IActionResult> GetByWorkItem(Guid workItemId, CancellationToken cancellationToken)
    {
        var response = await _mediator.Send(
            new GetLabelsByWorkItemQuery
            {
                WorkItemId = workItemId
            },
            cancellationToken);

        return Ok(response);
    }
}