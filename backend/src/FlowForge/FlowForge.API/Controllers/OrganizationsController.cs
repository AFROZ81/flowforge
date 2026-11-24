using FlowForge.Application.Features.Organizations.CreateOrganization;
using FlowForge.Application.Features.Organizations.GetOrganizations;
using FlowForge.Application.Features.Organizations.SwitchOrganization;
using FlowForge.Application.Features.Organizations.Members.Get;
using FlowForge.Application.Features.Organizations.Members.ChangeRole;
using FlowForge.Application.Features.Organizations.Members.Remove;
using FlowForge.Application.Services.Organizations;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace FlowForge.API.Controllers;

/// <summary>
/// Handles organization endpoints.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public sealed class OrganizationsController : ControllerBase
{
    private readonly IOrganizationService _organizationService;
    private readonly IMediator _mediator;

    public OrganizationsController(IOrganizationService organizationService, IMediator mediator)
    {
        _organizationService = organizationService;
        _mediator = mediator;
    }

    /// <summary>
    /// Lists the workspaces a new account can be created in.
    /// </summary>
    /// <remarks>
    /// Reachable without a token on purpose: the sign-up form has to offer
    /// this choice before anyone is signed in. Only the identifier and the
    /// public label come back, so no private organization data is exposed.
    /// </remarks>
    [HttpGet("options")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(List<OrganizationOption>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<OrganizationOption>>> GetOptions(CancellationToken cancellationToken)
    {
        List<OrganizationOption> options = await _organizationService.GetOptionsAsync(cancellationToken);

        return Ok(options);
    }

    /// <summary>
    /// Creates a new organization.
    /// </summary>
    [HttpPost]
    [EnableRateLimiting("OrgCreationPolicy")]
    [ProducesResponseType(typeof(CreateOrganizationResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    [ProducesResponseType(StatusCodes.Status429TooManyRequests)]
    public async Task<ActionResult<CreateOrganizationResponse>> Create(CreateOrganizationRequest request, CancellationToken cancellationToken)
    {
        try
        {
            CreateOrganizationResponse response = await _organizationService.CreateAsync(request, cancellationToken);

            return CreatedAtAction(nameof(Create), new { id = response.Id }, response);
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new
            {
                message = ex.Message
            });
        }
    }

    /// <summary>
    /// Switches the current organization.
    /// </summary>
    [HttpPost("switch")]
    [ProducesResponseType(typeof(SwitchOrganizationResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<SwitchOrganizationResponse>> Switch(SwitchOrganizationRequest request, CancellationToken cancellationToken)
    {
        var command = new SwitchOrganizationCommand { OrganizationId = request.OrganizationId };

        var response = await _mediator.Send(command, cancellationToken);

        return Ok(response);
    }

    /// <summary>
    /// Gets all members of the current organization.
    /// </summary>
    [HttpGet("{organizationId:guid}/members")]
    [ProducesResponseType(typeof(List<GetMembersResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<List<GetMembersResponse>>> GetMembers(Guid organizationId, CancellationToken cancellationToken)
    {
        var query = new GetMembersQuery { OrganizationId = organizationId };
        var response = await _mediator.Send(query, cancellationToken);
        return Ok(response);
    }

    /// <summary>
    /// Changes a member's role in the organization.
    /// </summary>
    [HttpPut("{organizationId:guid}/members/{userId:guid}/role")]
    [ProducesResponseType(typeof(ChangeMemberRoleResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ChangeMemberRoleResponse>> ChangeMemberRole(
        Guid organizationId,
        Guid userId,
        ChangeMemberRoleRequest request,
        CancellationToken cancellationToken)
    {
        var command = new ChangeMemberRoleCommand
        {
            OrganizationId = organizationId,
            TargetUserId = userId,
            Role = request.Role
        };

        try
        {
            var response = await _mediator.Send(command, cancellationToken);
            return Ok(response);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Removes a member from the organization.
    /// </summary>
    [HttpDelete("{organizationId:guid}/members/{userId:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> RemoveMember(Guid organizationId, Guid userId, CancellationToken cancellationToken)
    {
        var command = new RemoveMemberCommand
        {
            OrganizationId = organizationId,
            TargetUserId = userId
        };

        try
        {
            await _mediator.Send(command, cancellationToken);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}