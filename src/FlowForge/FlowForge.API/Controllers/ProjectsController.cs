using FlowForge.Application.Common.Responses;
using FlowForge.Application.Features.Projects.Create;
using FlowForge.Application.Features.Projects.GetAll;
using FlowForge.Application.Features.Projects.GetById;
using FlowForge.Application.Features.Projects.Update;
using FlowForge.Application.Features.Projects.Archive;
using FlowForge.Application.Features.Projects.Restore;

using MediatR;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FlowForge.API.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public sealed class ProjectsController : ControllerBase
{
    private readonly IMediator _mediator;

    public ProjectsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<CreateProjectResponse>>> Create(CreateProjectCommand command, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(command, cancellationToken);

        return Ok(ApiResponse<CreateProjectResponse>.SuccessResponse(result, "Project created successfully."));
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] GetProjectsQuery query, CancellationToken cancellationToken)
    {
        var response = await _mediator.Send(query, cancellationToken);

        return Ok(response);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
    {
        var response = await _mediator.Send(new GetProjectByIdQuery(id), cancellationToken);

        return Ok(response);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, UpdateProjectCommand command, CancellationToken cancellationToken)
    {
        if (id != command.ProjectId)
            return BadRequest("Route id does not match request id.");

        var response = await _mediator.Send(command, cancellationToken);

        return Ok(response);
    }

    [HttpPatch("{id:guid}/archive")]
    public async Task<IActionResult> Archive(Guid id, CancellationToken cancellationToken)
    {
        var command = new ArchiveProjectCommand
        {
            ProjectId = id
        };

        var response = await _mediator.Send(command, cancellationToken);

        return Ok(response);
    }

    [HttpPatch("{id:guid}/restore")]
    public async Task<IActionResult> Restore(
        Guid id,
        CancellationToken cancellationToken)
    {
        var command = new RestoreProjectCommand
        {
            ProjectId = id
        };

        var response = await _mediator.Send(command, cancellationToken);

        return Ok(response);
    }
}