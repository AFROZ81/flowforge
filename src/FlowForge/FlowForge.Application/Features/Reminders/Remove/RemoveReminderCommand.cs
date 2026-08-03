using FlowForge.Application.Common.Responses;
using MediatR;

namespace FlowForge.Application.Features.Reminders.Remove;

public sealed record RemoveReminderCommand : IRequest<ApiResponse<RemoveReminderResponse>>
{
    public Guid WorkItemId { get; init; }
}