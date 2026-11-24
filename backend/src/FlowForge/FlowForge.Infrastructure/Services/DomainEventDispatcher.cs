using FlowForge.Application.Interfaces;
using FlowForge.Domain.Events;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace FlowForge.Infrastructure.Services;

/// <summary>
/// Dispatches domain events to registered handlers using MediatR or DI.
/// </summary>
public sealed class DomainEventDispatcher : IDomainEventDispatcher
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<DomainEventDispatcher> _logger;

    public DomainEventDispatcher(IServiceProvider serviceProvider, ILogger<DomainEventDispatcher> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    public async Task DispatchAsync<TEvent>(TEvent domainEvent, CancellationToken cancellationToken = default)
        where TEvent : IDomainEvent
    {
        using var scope = _serviceProvider.CreateScope();
        var handlers = scope.ServiceProvider.GetServices<IDomainEventHandler<TEvent>>();

        var tasks = handlers.Select(handler =>
        {
            try
            {
                return handler.HandleAsync(domainEvent, cancellationToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error handling domain event {EventType}", typeof(TEvent).Name);
                return Task.CompletedTask;
            }
        });

        await Task.WhenAll(tasks);
    }
}