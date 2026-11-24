using FlowForge.Application.Features.Webhooks.CreateWebhook;
using FlowForge.Application.Features.Webhooks.DeleteWebhook;
using FlowForge.Application.Features.Webhooks.GetWebhooks;
using FlowForge.Application.Features.Webhooks.TestWebhook;
using FlowForge.Application.Features.Webhooks.UpdateWebhook;
using FlowForge.Application.Services.Webhooks;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FlowForge.API.Controllers;

/// <summary>
/// Handles webhook subscription endpoints.
/// </summary>
[ApiController]
[Authorize]
[Route("api/[controller]")]
public sealed class WebhooksController : ControllerBase
{
    private readonly IWebhookService _webhookService;
    private readonly IMediator _mediator;

    public WebhooksController(IWebhookService webhookService, IMediator mediator)
    {
        _webhookService = webhookService;
        _mediator = mediator;
    }

    /// <summary>
    /// Lists all webhook subscriptions for the current organization.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(List<GetWebhooksResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<List<GetWebhooksResponse>>> Get(CancellationToken cancellationToken)
    {
        // Get current user's organization from claims
        var organizationIdClaim = User.FindFirst("organizationId");
        if (organizationIdClaim == null || !Guid.TryParse(organizationIdClaim.Value, out var organizationId))
        {
            return Unauthorized();
        }

        var webhooks = await _webhookService.GetAsync(organizationId, cancellationToken);
        return Ok(webhooks);
    }

    /// <summary>
    /// Creates a new webhook subscription.
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(CreateWebhookResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<CreateWebhookResponse>> Create(CreateWebhookRequest request, CancellationToken cancellationToken)
    {
        var organizationIdClaim = User.FindFirst("organizationId");
        if (organizationIdClaim == null || !Guid.TryParse(organizationIdClaim.Value, out var organizationId))
        {
            return Unauthorized();
        }

        var command = new CreateWebhookCommand
        {
            Name = request.Name,
            Url = request.Url,
            Secret = request.Secret,
            EventTypes = request.EventTypes,
            OrganizationId = organizationId,
        };

        var response = await _mediator.Send(command, cancellationToken);
        return CreatedAtAction(nameof(Get), new { id = response.Id }, response);
    }

    /// <summary>
    /// Updates an existing webhook subscription.
    /// </summary>
    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(UpdateWebhookResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<UpdateWebhookResponse>> Update(Guid id, UpdateWebhookRequest request, CancellationToken cancellationToken)
    {
        var response = await _webhookService.UpdateAsync(id, request, cancellationToken);
        return Ok(response);
    }

    /// <summary>
    /// Deletes a webhook subscription.
    /// </summary>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        await _webhookService.DeleteAsync(id, cancellationToken);
        return NoContent();
    }

    /// <summary>
    /// Tests a webhook subscription by sending a test payload.
    /// </summary>
    [HttpPost("{id:guid}/test")]
    [ProducesResponseType(typeof(TestWebhookResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<TestWebhookResponse>> Test(Guid id, CancellationToken cancellationToken)
    {
        var response = await _webhookService.TestAsync(id, cancellationToken);
        return Ok(response);
    }
}