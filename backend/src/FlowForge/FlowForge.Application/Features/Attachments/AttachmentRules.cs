using FlowForge.Application.Common.Exceptions;
using FlowForge.Application.Features.WorkItems;
using FlowForge.Application.Interfaces;
using FlowForge.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace FlowForge.Application.Features.Attachments;

public sealed class AttachmentRules
{
    private readonly IApplicationDbContext _context;
    private readonly WorkItemRules _workItemRules;

    public AttachmentRules(IApplicationDbContext context, WorkItemRules workItemRules)
    {
        _context = context;
        _workItemRules = workItemRules;
    }

    public async Task<WorkItem> GetWorkItemAsync(Guid workItemId, Guid organizationId, CancellationToken cancellationToken)
    {
        return await _workItemRules.GetByIdAsync(workItemId, organizationId, cancellationToken);
    }

    public async Task<Attachment> GetByIdAsync(Guid attachmentId, Guid organizationId, CancellationToken cancellationToken)
    {
        var attachment = await _context.Attachments
            .Include(x => x.WorkItem)
                .ThenInclude(x => x.Column)
                    .ThenInclude(x => x.Board)
                        .ThenInclude(x => x.Project)
            .FirstOrDefaultAsync(
                x => x.Id == attachmentId &&
                     !x.IsDeleted &&
                     x.WorkItem.Column.Board.Project.OrganizationId
                         == organizationId,
                cancellationToken);

        if (attachment is null)
            throw new NotFoundException("Attachment not found.");

        return attachment;
    }

    public void EnsureWorkItemNotArchived(WorkItem workItem)
    {
        if (workItem.IsArchived)
            throw new BadRequestException("Cannot add attachments to an archived Work Item.");
    }

    public void EnsureUploader(Attachment attachment, Guid userId)
    {
        if (attachment.UploadedById != userId)
            throw new BadRequestException("You can only delete your own attachments.");
    }
}