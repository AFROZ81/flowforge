using FlowForge.Domain.Enums;

namespace FlowForge.Application.Services.WorkItemHistories;

public interface IWorkItemHistoryService
{
    Task CreateAsync(Guid workItemId, Guid userId, WorkItemHistoryAction action, string description, CancellationToken cancellationToken = default);
}