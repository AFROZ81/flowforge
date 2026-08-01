using FlowForge.Application.Features.Reports.WorkItemSummary;
using FlowForge.Application.Features.Reports.ProjectSummary;
using FlowForge.Application.Features.Reports.AssigneeSummary;
using FlowForge.Application.Features.Reports.LabelUsage;
using FlowForge.Application.Features.Reports.ProductivityTrends;
using FlowForge.Application.Features.Reports.Export;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FlowForge.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public sealed class ReportsController : ControllerBase
{
    private readonly IMediator _mediator;

    public ReportsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("work-items/summary")]
    public async Task<IActionResult> GetWorkItemSummary(CancellationToken cancellationToken)
    {
        var response = await _mediator.Send(new GetWorkItemSummaryQuery(), cancellationToken);

        return Ok(response);
    }

    [HttpGet("projects/summary")]
    public async Task<IActionResult> GetProjectSummary(CancellationToken cancellationToken)
    {
        var response = await _mediator.Send(new GetProjectSummaryQuery(), cancellationToken);

        return Ok(response);
    }

    [HttpGet("assignees/summary")]
    public async Task<IActionResult> GetAssigneeSummary(CancellationToken cancellationToken)
    {
        var response = await _mediator.Send(new GetAssigneeSummaryQuery(), cancellationToken);

        return Ok(response);
    }

    [HttpGet("labels/usage")]
    public async Task<IActionResult> GetLabelUsage(CancellationToken cancellationToken)
    {
        var response = await _mediator.Send(new GetLabelUsageQuery(), cancellationToken);

        return Ok(response);
    }
    
    [HttpGet("productivity-trends")]
    public async Task<IActionResult> GetProductivityTrends([FromQuery] int days = 30, CancellationToken cancellationToken = default)
    {
        var response = await _mediator.Send(
            new GetProductivityTrendsQuery
            {
                Days = days
            },
            cancellationToken);

        return Ok(response);
    }

    [HttpGet("export/work-items")]
    public async Task<IActionResult> ExportWorkItems(CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new ExportWorkItemsCsvQuery(), cancellationToken);

        return File(result.Content, result.ContentType, result.FileName);
    }
}
