using FlowForge.Application.Interfaces;
using FlowForge.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using FlowForge.Infrastructure.Services.Organizations;
using FlowForge.Application.Services.Organizations;

namespace FlowForge.Infrastructure.DependencyInjection;

/// <summary>
/// Registers Infrastructure services.
/// </summary>
public static class InfrastructureServiceCollection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<ApplicationDbContext>(options => options.UseSqlServer(configuration.GetConnectionString("DefaultConnection")));

        services.AddScoped<IApplicationDbContext>(provider => provider.GetRequiredService<ApplicationDbContext>());
        
        services.AddScoped<IOrganizationService, OrganizationService>();

        return services;
    }
}