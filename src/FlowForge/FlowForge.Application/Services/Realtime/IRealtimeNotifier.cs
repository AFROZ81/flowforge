namespace FlowForge.Application.Services.Realtime;

public interface IRealtimeNotifier
{
    Task NotifyUserAsync(Guid userId, string eventName, object payload, CancellationToken cancellationToken = default);

    Task NotifyOrganizationAsync(Guid organizationId, string eventName, object payload, CancellationToken cancellationToken = default);
}