namespace FlowForge.Application.Services.WorkItems;

public interface IWorkItemOrderingService
{
    Task<long> GetNextDisplayOrderAsync(Guid columnId, Guid? excludedWorkItemId, int destinationIndex, CancellationToken cancellationToken);

    Task NormalizeColumnAsync(Guid columnId, CancellationToken cancellationToken);
}