using FlowForge.Application.Features.Organizations.CreateOrganization;
using FlowForge.Application.Features.Organizations.GetOrganizations;
using FlowForge.Application.Services.Organizations;
using Microsoft.AspNetCore.Mvc;

namespace FlowForge.API.Controllers;

/// <summary>
/// Handles organization endpoints.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public sealed class OrganizationsController : ControllerBase
{
    private readonly IOrganizationService _organizationService;

    public OrganizationsController(IOrganizationService organizationService)
    {
        _organizationService = organizationService;
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
    [ProducesResponseType(typeof(CreateOrganizationResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
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
}