using FlowForge.Application.Common.Responses;
using FlowForge.Domain.Common.Enums;
using MediatR;

namespace FlowForge.Application.Features.WorkItems.Edit;

public sealed record EditWorkItemCommand : IRequest<ApiResponse<EditWorkItemResponse>>
{
    public Guid WorkItemId { get; init; }

    public string? Description { get; init; }

    public WorkItemPriority Priority { get; init; }

    public DateTime? DueDate { get; init; }
}