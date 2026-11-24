using FlowForge.Application.Common.Exceptions;
using FlowForge.Application.Features.Organizations.Invitations.Accept;
using FlowForge.Application.Features.Organizations.Invitations.Create;
using FlowForge.Application.Features.Organizations.Invitations.Delete;
using FlowForge.Application.Features.Organizations.Invitations.Get;
using FlowForge.Application.Features.Organizations.Invitations.Resend;
using FlowForge.Application.Services;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
namespace FlowForge.API.Controllers;

/// <summary>
/// Handles organization invitation endpoints.
/// </summary>
[ApiController]
[Authorize]
[Route("api/[controller]")]
public sealed class InvitationsController : ControllerBase
{
    private readonly IMediator _mediator;

    public InvitationsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Creates a new organization invitation.
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(CreateInvitationResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<ActionResult<CreateInvitationResponse>> Create(CreateInvitationRequest request, CancellationToken cancellationToken)
    {
        var organizationIdClaim = User.FindFirst("organizationId");
        if (organizationIdClaim == null || !Guid.TryParse(organizationIdClaim.Value, out var organizationId))
        {
            return Unauthorized();
        }

        var command = new CreateInvitationCommand
        {
            Email = request.Email,
            Role = request.Role,
            Message = request.Message,
            OrganizationId = organizationId
        };

        try
        {
            var response = await _mediator.Send(command, cancellationToken);
            return CreatedAtAction(nameof(Get), response);
        }
        catch (ConflictException ex)
        {
            return Conflict(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Gets all invitations for the current organization.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(List<GetInvitationsResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<List<GetInvitationsResponse>>> Get(CancellationToken cancellationToken)
    {
        var organizationIdClaim = User.FindFirst("organizationId");
        if (organizationIdClaim == null || !Guid.TryParse(organizationIdClaim.Value, out var organizationId))
        {
            return Unauthorized();
        }

        var query = new GetInvitationsQuery { OrganizationId = organizationId };
        var response = await _mediator.Send(query, cancellationToken);
        return Ok(response);
    }

    /// <summary>
    /// Deletes/revokes an organization invitation.
    /// </summary>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var command = new DeleteInvitationCommand { Id = id };
        await _mediator.Send(command, cancellationToken);
        return NoContent();
    }

    /// <summary>
    /// Resends an organization invitation.
    /// </summary>
    [HttpPost("{id:guid}/resend")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Resend(Guid id, CancellationToken cancellationToken)
    {
        var command = new ResendInvitationCommand { Id = id };
        try
        {
            await _mediator.Send(command, cancellationToken);
            return Ok(new { message = "Invitation resent successfully" });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Validates an invitation token and returns its details without accepting.
    /// Used by the registration flow to pre-fill the invitee's email.
    /// </summary>
    [HttpGet("validate")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(AcceptInvitationQueryResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<AcceptInvitationQueryResponse>> Validate(string token, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(token))
        {
            return NotFound(new { message = "Invitation token is required." });
        }

        var query = new AcceptInvitationQuery { Token = token };
        var response = await _mediator.Send(query, cancellationToken);

        if (response.IsAccepted)
        {
            return NotFound(new { message = "This invitation has already been accepted." });
        }

        return Ok(response);
    }

    /// <summary>
    /// Accepts an organization invitation using a token.
    /// </summary>
    [HttpPost("accept")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(AcceptInvitationResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status410Gone)]
    public async Task<ActionResult<AcceptInvitationResponse>> Accept(AcceptInvitationCommand command, CancellationToken cancellationToken)
    {
        try
        {
            var response = await _mediator.Send(command, cancellationToken);
            return Ok(response);
        }
        catch (InvalidOperationException ex)
        {
            return ex.Message switch
            {
                "Invitation not found." => NotFound(new { message = ex.Message }),
                "Invitation has expired." => StatusCode(StatusCodes.Status410Gone, new { message = ex.Message }),
                "Invitation has already been accepted." => BadRequest(new { message = ex.Message }),
                _ => BadRequest(new { message = ex.Message })
            };
        }
    }

    /// <summary>
    /// Diagnostics for SMTP configuration (admin only).
    ///
    /// Verifies that SMTP is configured and that the service can connect,
    /// authenticate, and use TLS. No credentials are returned or logged, and no
    /// email is sent to any real recipient.
    /// </summary>
    [HttpGet("smtp-diagnostics")]
    [Authorize(Policy = "RequireAdmin")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<object>> GetSmtpDiagnostics(
        [FromServices] IEmailService emailService,
        CancellationToken cancellationToken)
    {
        var result = await emailService.TestSmtpConnectionAsync(cancellationToken);

        return Ok(new
        {
            configured = result.Success || result.ErrorCode != "smtp_not_configured",
            success = result.Success,
            error = result.Success ? null : result.Error,
            errorCode = result.ErrorCode,
            checkedAtUtc = DateTime.UtcNow,
        });
    }
}