using FlowForge.Application.Common.Exceptions;
using FlowForge.Application.Features.WorkItems;
using FlowForge.Application.Interfaces;
using FlowForge.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace FlowForge.Application.Features.Comments;

public sealed class CommentRules
{
    private readonly IApplicationDbContext _context;
    private readonly WorkItemRules _workItemRules;

    public CommentRules(IApplicationDbContext context, WorkItemRules workItemRules)
    {
        _context = context;
        _workItemRules = workItemRules;
    }

    public async Task<WorkItem> GetWorkItemAsync(Guid workItemId, Guid organizationId, CancellationToken cancellationToken)
    {
        return await _workItemRules.GetByIdAsync(workItemId, organizationId, cancellationToken);
    }

    public async Task<Comment> GetByIdAsync(Guid commentId, Guid organizationId, CancellationToken cancellationToken)
    {
        var comment = await _context.Comments
            .Include(x => x.WorkItem)
                .ThenInclude(x => x.Column)
                    .ThenInclude(x => x.Board)
                        .ThenInclude(x => x.Project)
            .FirstOrDefaultAsync(
                x => x.Id == commentId &&
                    !x.IsDeleted &&
                    x.WorkItem.Column.Board.Project.OrganizationId == organizationId,
                cancellationToken);

        if (comment is null)
            throw new NotFoundException("Comment not found.");

        return comment;
    }

    public void EnsureWorkItemNotArchived(WorkItem workItem)
    {
        if (workItem.IsArchived)
            throw new BadRequestException("Cannot add comments to an archived Work Item.");
    }

    public void EnsureAuthor(Comment comment, Guid userId)
    {
        if (comment.AuthorId != userId)
            throw new BadRequestException("You can only modify your own comments.");
    }
}