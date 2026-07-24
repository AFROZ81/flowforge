using FlowForge.Application.Common.Responses;
using FlowForge.Domain.Common.Enums;
using MediatR;

namespace FlowForge.Application.Features.WorkItems.Create;

public sealed record CreateWorkItemCommand : IRequest<ApiResponse<CreateWorkItemResponse>>
{
    public Guid ColumnId { get; init; }

    public string Title { get; init; } = string.Empty;

    public string? Description { get; init; }

    public WorkItemPriority Priority { get; init; }

    public DateTime? DueDate { get; init; }
}