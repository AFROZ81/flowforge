using FlowForge.Application.Features.Users.GetOrganizationUsers;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FlowForge.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public sealed class UsersController : ControllerBase
{
    private readonly ISender _sender;

    public UsersController(ISender sender)
    {
        _sender = sender;
    }

    /// <summary>
    /// Gets all users belonging to the current user's organization.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetOrganizationUsers(
        CancellationToken cancellationToken)
    {
        var result =
            await _sender.Send(
                new GetOrganizationUsersQuery(),
                cancellationToken);

        return Ok(result);
    }
}