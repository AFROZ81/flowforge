using FlowForge.Application.Interfaces;
using FlowForge.Application.Services.WorkItemHistories;
using FlowForge.Domain.Entities;
using FlowForge.Domain.Enums;

namespace FlowForge.Infrastructure.Services.WorkItemHistories;

public sealed class WorkItemHistoryService : IWorkItemHistoryService
{
    private readonly IApplicationDbContext _context;

    public WorkItemHistoryService(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task CreateAsync(Guid workItemId, Guid userId, WorkItemHistoryAction action, string description, CancellationToken cancellationToken = default)
    {
        var history = new WorkItemHistory(workItemId, userId, action, description);

        _context.WorkItemHistories.Add(history);

        await _context.SaveChangesAsync(cancellationToken);
    }
}