using FlowForge.Application.Common.Exceptions;
using FlowForge.Application.Interfaces;
using FlowForge.Domain.Entities;
using FlowForge.Application.Features.WorkItems;
using Microsoft.EntityFrameworkCore;

namespace FlowForge.Application.Features.Labels;

public sealed class LabelRules
{
    private readonly IApplicationDbContext _context;
    private readonly WorkItemRules _workItemRules;

    public LabelRules(IApplicationDbContext context, WorkItemRules workItemRules)
    {
        _context = context;
        _workItemRules = workItemRules;
    }

    public async Task<Label> GetByIdAsync(Guid labelId, Guid organizationId, CancellationToken cancellationToken)
    {
        var label = await _context.Labels
            .FirstOrDefaultAsync(
                x => x.Id == labelId &&
                     x.OrganizationId == organizationId &&
                     !x.IsDeleted,
                cancellationToken);

        if (label is null)
            throw new NotFoundException("Label not found.");

        return label;
    }

    public async Task EnsureNameUniqueAsync(Guid organizationId, string name, Guid? excludeLabelId, CancellationToken cancellationToken)
    {
        var normalizedName = name.Trim();

        var exists = await _context.Labels
            .AnyAsync(
                x => x.OrganizationId == organizationId &&
                     x.Name == normalizedName &&
                     (!excludeLabelId.HasValue ||
                      x.Id != excludeLabelId.Value),
                cancellationToken);

        if (exists)
            throw new BadRequestException("A label with this name already exists.");
    }

    public async Task<WorkItem> GetWorkItemAsync(Guid workItemId, Guid organizationId, CancellationToken cancellationToken)
    {
        return await _workItemRules.GetByIdAsync(workItemId, organizationId, cancellationToken);
    }

    public void EnsureWorkItemNotArchived(WorkItem workItem)
    {
        if (workItem.IsArchived)
            throw new BadRequestException("Cannot modify labels on an archived Work Item.");
    }

    public async Task<WorkItemLabel?> GetAssignmentAsync(Guid workItemId, Guid labelId, CancellationToken cancellationToken)
    {
        return await _context.WorkItemLabels
            .FirstOrDefaultAsync(
                x => x.WorkItemId == workItemId &&
                    x.LabelId == labelId,
                cancellationToken);
    }
 
    public async Task<WorkItemLabel> GetActiveAssignmentAsync(Guid workItemId, Guid labelId, CancellationToken cancellationToken)
    {
        var assignment = await _context.WorkItemLabels
            .FirstOrDefaultAsync(
                x => x.WorkItemId == workItemId &&
                    x.LabelId == labelId &&
                    !x.IsDeleted,
                cancellationToken);

        if (assignment is null)
            throw new NotFoundException("Label is not assigned to this Work Item.");

        return assignment;
    }
}