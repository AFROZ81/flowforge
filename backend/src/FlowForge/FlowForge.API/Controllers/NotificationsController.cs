using FlowForge.Application.Features.Notifications.GetMyNotifications;
using FlowForge.Application.Features.Notifications.GetUnreadCount;
using FlowForge.Application.Features.Notifications.MarkAsRead;
using FlowForge.Application.Features.Notifications.MarkAsUnread;
using FlowForge.Application.Features.Notifications.MarkAllAsRead;
using FlowForge.Application.Features.Notifications.Delete;
using FlowForge.Application.Features.Notifications.GetNotificationById;

using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FlowForge.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public sealed class NotificationsController : ControllerBase
{
    private readonly IMediator _mediator;

    public NotificationsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    #region Queries

    [HttpGet]
    public async Task<IActionResult> GetMyNotifications(CancellationToken cancellationToken)
    {
        var response = await _mediator.Send(new GetMyNotificationsQuery(), cancellationToken);

        return Ok(response);
    }

    #endregion

    [HttpGet("unread-count")]
    public async Task<IActionResult> GetUnreadCount(CancellationToken cancellationToken)
    {
        var response = await _mediator.Send(new GetUnreadCountQuery(), cancellationToken);

        return Ok(response);
    }

    #region Commands

    [HttpPatch("{id:guid}/read")]
    public async Task<IActionResult> MarkAsRead(Guid id, CancellationToken cancellationToken)
    {
        var response = await _mediator.Send(
            new MarkNotificationAsReadCommand
            {
                NotificationId = id
            },
            cancellationToken);

        return Ok(response);
    }

    #endregion

    [HttpPatch("{id:guid}/unread")]
    public async Task<IActionResult> MarkAsUnread(Guid id, CancellationToken cancellationToken)
    {
        var response = await _mediator.Send(
            new MarkNotificationAsUnreadCommand 
            {
                NotificationId = id
            },
            cancellationToken);

        return Ok(response);
    }

    [HttpPatch("read-all")]
    public async Task<IActionResult> MarkAllAsRead(CancellationToken cancellationToken)
    {
        var response = await _mediator.Send(new MarkAllNotificationsAsReadCommand(), cancellationToken);

        return Ok(response);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var response = await _mediator.Send(
            new DeleteNotificationCommand
            {
                NotificationId = id
            },
            cancellationToken);

        return Ok(response);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
    {
        var response = await _mediator.Send(
            new GetNotificationByIdQuery
            {
                NotificationId = id
            },
            cancellationToken);

        return Ok(response);
    }
}