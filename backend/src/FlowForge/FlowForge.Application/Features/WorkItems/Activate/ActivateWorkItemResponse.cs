using FlowForge.Domain.Common.Enums;

namespace FlowForge.Application.Features.WorkItems.Activate;

public sealed class ActivateWorkItemResponse
{
    public Guid Id { get; init; }

    public WorkItemStatus Status { get; init; }
}