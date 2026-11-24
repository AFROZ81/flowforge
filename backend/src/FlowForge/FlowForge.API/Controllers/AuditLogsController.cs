using FlowForge.Application.Features.AuditLogs.GetAuditLogs;
using FlowForge.Application.Services.AuditLogs;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FlowForge.API.Controllers;

/// <summary>
/// Handles audit log endpoints.
/// </summary>
[ApiController]
[Authorize(Policy = "RequireAdmin")]
[Route("api/[controller]")]
public sealed class AuditLogsController : ControllerBase
{
    private readonly IAuditLogService _auditLogService;
    private readonly IMediator _mediator;

    public AuditLogsController(IAuditLogService auditLogService, IMediator mediator)
    {
        _auditLogService = auditLogService;
        _mediator = mediator;
    }

    /// <summary>
    /// Gets audit logs with filtering and pagination.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(PagedResult<GetAuditLogsResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<PagedResult<GetAuditLogsResponse>>> Get([FromQuery] GetAuditLogsRequest request, CancellationToken cancellationToken)
    {
        var organizationIdClaim = User.FindFirst("organizationId");
        if (organizationIdClaim == null || !Guid.TryParse(organizationIdClaim.Value, out var organizationId))
        {
            return Unauthorized();
        }

        var requestWithOrg = new GetAuditLogsRequest
        {
            OrganizationId = organizationId,
            Page = request.Page,
            PageSize = request.PageSize,
            FromDate = request.FromDate,
            ToDate = request.ToDate,
            Type = request.Type,
            ActorId = request.ActorId,
            TargetEntityId = request.TargetEntityId,
            TargetEntityType = request.TargetEntityType,
            ActorIdStr = request.ActorIdStr,
            IsSensitive = request.IsSensitive,
            Search = request.Search,
            SortBy = request.SortBy,
            SortDescending = request.SortDescending
        };

        var result = await _mediator.Send(requestWithOrg, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Gets audit log statistics for the current organization.
    /// </summary>
    [HttpGet("statistics")]
    [ProducesResponseType(typeof(AuditLogStatistics), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<AuditLogStatistics>> GetStatistics(CancellationToken cancellationToken)
    {
        var organizationIdClaim = User.FindFirst("organizationId");
        if (organizationIdClaim == null || !Guid.TryParse(organizationIdClaim.Value, out var organizationId))
        {
            return Unauthorized();
        }

        var stats = await _auditLogService.GetStatisticsAsync(organizationId, cancellationToken);
        return Ok(stats);
    }
}