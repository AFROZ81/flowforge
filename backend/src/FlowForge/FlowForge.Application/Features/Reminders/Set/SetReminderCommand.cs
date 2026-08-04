using FlowForge.Application.Common.Responses;
using MediatR;

namespace FlowForge.Application.Features.Reminders.Set;

public sealed record SetReminderCommand : IRequest<ApiResponse<SetReminderResponse>>
{
    public Guid WorkItemId { get; init; }

    public DateTime? DueDate { get; init; }

    public DateTime? ReminderDate { get; init; }
}