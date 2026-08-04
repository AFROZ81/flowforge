using FlowForge.Domain.Common.Enums;

namespace FlowForge.Application.Features.WorkItems.Block;

public sealed class BlockWorkItemResponse
{
    public Guid Id { get; init; }

    public WorkItemStatus Status { get; init; }
}