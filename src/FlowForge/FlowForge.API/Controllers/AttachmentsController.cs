using FlowForge.API.Models.Attachments;
using FlowForge.Application.Features.Attachments.Upload;
using FlowForge.Application.Features.Attachments.GetAttachmentById;
using FlowForge.Application.Features.Attachments.GetAttachmentsByWorkItem;
using FlowForge.Application.Features.Attachments.Download;
using FlowForge.Application.Features.Attachments.Delete;

using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FlowForge.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public sealed class AttachmentsController : ControllerBase
{
    private readonly IMediator _mediator;

    public AttachmentsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    #region Commands

    [HttpPost]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> Upload([FromForm] UploadAttachmentRequest request, CancellationToken cancellationToken)
    {
        await using var stream = request.File.OpenReadStream();

        var response = await _mediator.Send(
            new UploadAttachmentCommand
            {
                WorkItemId = request.WorkItemId,
                FileName = request.File.FileName,
                ContentType = request.File.ContentType,
                FileSize = request.File.Length,
                Content = stream
            },
            cancellationToken);

        return Ok(response);
    }

    #endregion

    #region Queries

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
    {
        var response = await _mediator.Send(
            new GetAttachmentByIdQuery
            {
                Id = id
            },
            cancellationToken);

        return Ok(response);
    }

    #endregion

    [HttpGet("workitem/{workItemId:guid}")]
    public async Task<IActionResult> GetByWorkItem(Guid workItemId, CancellationToken cancellationToken)
    {
        var response = await _mediator.Send(
            new GetAttachmentsByWorkItemQuery
            {
                WorkItemId = workItemId
            },
            cancellationToken);

        return Ok(response);
    }

    [HttpGet("{id:guid}/download")]
    public async Task<IActionResult> Download(Guid id, CancellationToken cancellationToken)
    {
        var response = await _mediator.Send(
            new DownloadAttachmentQuery
            {
                AttachmentId = id
            },
            cancellationToken);

        return File(response.Content, response.ContentType, response.FileName);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var response = await _mediator.Send(
            new DeleteAttachmentCommand
            {
                AttachmentId = id
            },
            cancellationToken);

        return Ok(response);
    }
}