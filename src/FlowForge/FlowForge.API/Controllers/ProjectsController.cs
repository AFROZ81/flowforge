using FlowForge.Application.Common.Responses;
using FlowForge.Application.Features.Projects.Create;
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

        return Ok(ApiResponse<CreateProjectResponse>.SuccessResponse(
            result,
            "Project created successfully."));
    }
}