namespace FlowForge.Application.Features.WorkItemHistories.Get;

using FlowForge.Domain.Enums;

public sealed class GetWorkItemHistoryResponse
{
    public Guid Id { get; init; }

    public Guid UserId { get; init; }

    public WorkItemHistoryAction Action { get; init; }

    public string Description { get; init; } = string.Empty;

    public DateTime CreatedAt { get; init; }
}