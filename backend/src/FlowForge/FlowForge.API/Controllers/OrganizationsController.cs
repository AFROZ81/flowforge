using FlowForge.Application.Features.Organizations.CreateOrganization;
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