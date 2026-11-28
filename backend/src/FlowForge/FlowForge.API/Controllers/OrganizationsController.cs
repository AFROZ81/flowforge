using FlowForge.Application.Features.Organizations;
using FlowForge.Application.Features.Organizations.Archive;
using FlowForge.Application.Features.Organizations.CreateOrganization;
using FlowForge.Application.Features.Organizations.Delete;
using FlowForge.Application.Features.Organizations.Get;
using FlowForge.Application.Features.Organizations.GetMine;
using FlowForge.Application.Features.Organizations.Leave;
using FlowForge.Application.Features.Organizations.Members.ChangeRole;
using FlowForge.Application.Features.Organizations.Members.Get;
using FlowForge.Application.Features.Organizations.Members.Remove;
using FlowForge.Application.Features.Organizations.Restore;
using FlowForge.Application.Features.Organizations.SwitchOrganization;
using FlowForge.Application.Features.Organizations.TransferOwnership;
using FlowForge.Application.Features.Organizations.Update;
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
public sealed class OrganizationsController(IMediator mediator) : ControllerBase
{
    [HttpGet("mine")]
    [Authorize(Policy = "RequireAccount")]
    [ProducesResponseType(typeof(List<OrganizationMembershipResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<OrganizationMembershipResponse>>> GetMine(
        CancellationToken cancellationToken)
    {
        return Ok(await mediator.Send(new GetMyOrganizationsQuery(), cancellationToken));
    }

    [HttpPost]
    [Authorize(Policy = "RequireAccount")]
    [EnableRateLimiting("OrgCreationPolicy")]
    [ProducesResponseType(typeof(CreateOrganizationResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    [ProducesResponseType(StatusCodes.Status429TooManyRequests)]
    public async Task<ActionResult<CreateOrganizationResponse>> Create(
        CreateOrganizationRequest request,
        CancellationToken cancellationToken)
    {
        var response = await mediator.Send(request, cancellationToken);
        return CreatedAtAction(nameof(Create), new { id = response.Id }, response);
    }

    [HttpPost("switch")]
    [Authorize(Policy = "RequireAccount")]
    [ProducesResponseType(typeof(SwitchOrganizationResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<SwitchOrganizationResponse>> Switch(
        SwitchOrganizationRequest request,
        CancellationToken cancellationToken)
    {
        return Ok(await mediator.Send(
            new SwitchOrganizationCommand { OrganizationId = request.OrganizationId },
            cancellationToken));
    }

    [HttpGet("{organizationId:guid}")]
    [Authorize(Policy = "RequireOrganizationSession")]
    [ProducesResponseType(typeof(OrganizationResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<OrganizationResponse>> Get(
        Guid organizationId,
        CancellationToken cancellationToken)
    {
        return Ok(await mediator.Send(
            new GetOrganizationQuery(organizationId),
            cancellationToken));
    }

    [HttpPut("{organizationId:guid}")]
    [Authorize(Policy = "RequireAdmin")]
    [ProducesResponseType(typeof(OrganizationResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<OrganizationResponse>> Update(
        Guid organizationId,
        UpdateOrganizationRequest request,
        CancellationToken cancellationToken)
    {
        return Ok(await mediator.Send(
            new UpdateOrganizationCommand(
                organizationId,
                request.Name,
                request.Description,
                request.LogoUrl),
            cancellationToken));
    }

    [HttpGet("{organizationId:guid}/members")]
    [Authorize(Policy = "RequireOrganizationSession")]
    [ProducesResponseType(typeof(List<GetMembersResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<GetMembersResponse>>> GetMembers(
        Guid organizationId,
        CancellationToken cancellationToken)
    {
        return Ok(await mediator.Send(
            new GetMembersQuery { OrganizationId = organizationId },
            cancellationToken));
    }

    [HttpPut("{organizationId:guid}/members/{userId:guid}/role")]
    [Authorize(Policy = "RequireAdmin")]
    [ProducesResponseType(typeof(ChangeMemberRoleResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<ChangeMemberRoleResponse>> ChangeMemberRole(
        Guid organizationId,
        Guid userId,
        ChangeMemberRoleRequest request,
        CancellationToken cancellationToken)
    {
        return Ok(await mediator.Send(
            new ChangeMemberRoleCommand
            {
                OrganizationId = organizationId,
                TargetUserId = userId,
                Role = request.Role
            },
            cancellationToken));
    }

    [HttpDelete("{organizationId:guid}/members/{userId:guid}")]
    [Authorize(Policy = "RequireAdmin")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> RemoveMember(
        Guid organizationId,
        Guid userId,
        CancellationToken cancellationToken)
    {
        await mediator.Send(
            new RemoveMemberCommand
            {
                OrganizationId = organizationId,
                TargetUserId = userId
            },
            cancellationToken);

        return NoContent();
    }

    [HttpPost("{organizationId:guid}/leave")]
    [Authorize(Policy = "RequireOrganizationSession")]
    [ProducesResponseType(typeof(OrganizationSessionResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<OrganizationSessionResponse>> Leave(
        Guid organizationId,
        CancellationToken cancellationToken)
    {
        return Ok(await mediator.Send(
            new LeaveOrganizationCommand(organizationId),
            cancellationToken));
    }

    [HttpPost("{organizationId:guid}/transfer-ownership")]
    [Authorize(Policy = "RequireOwner")]
    [ProducesResponseType(typeof(OrganizationSessionResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<OrganizationSessionResponse>> TransferOwnership(
        Guid organizationId,
        TransferOwnershipRequest request,
        CancellationToken cancellationToken)
    {
        return Ok(await mediator.Send(
            new TransferOwnershipCommand(organizationId, request.TargetUserId),
            cancellationToken));
    }

    [HttpPost("{organizationId:guid}/archive")]
    [Authorize(Policy = "RequireOwner")]
    [ProducesResponseType(typeof(OrganizationSessionResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<OrganizationSessionResponse>> Archive(
        Guid organizationId,
        CancellationToken cancellationToken)
    {
        return Ok(await mediator.Send(
            new ArchiveOrganizationCommand(organizationId),
            cancellationToken));
    }

    [HttpPost("{organizationId:guid}/restore")]
    [Authorize(Policy = "RequireAccount")]
    [ProducesResponseType(typeof(OrganizationSessionResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<OrganizationSessionResponse>> Restore(
        Guid organizationId,
        CancellationToken cancellationToken)
    {
        return Ok(await mediator.Send(
            new RestoreOrganizationCommand(organizationId),
            cancellationToken));
    }

    [HttpDelete("{organizationId:guid}")]
    [Authorize(Policy = "RequireAccount")]
    [ProducesResponseType(typeof(OrganizationSessionResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<OrganizationSessionResponse>> Delete(
        Guid organizationId,
        DeleteOrganizationRequest request,
        CancellationToken cancellationToken)
    {
        return Ok(await mediator.Send(
            new DeleteOrganizationCommand(organizationId, request.ConfirmationSlug),
            cancellationToken));
    }
}
