using FlowForge.Domain.Common.Enums;

namespace FlowForge.Application.Features.WorkItems.Complete;

public sealed class CompleteWorkItemResponse
{
    public Guid Id { get; init; }

    public WorkItemStatus Status { get; init; }
}