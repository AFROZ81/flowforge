using FlowForge.Application.Interfaces;
using FlowForge.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using FlowForge.Infrastructure.Services.Organizations;
using FlowForge.Application.Services.Organizations;
using FlowForge.Infrastructure.Identity;
using Microsoft.AspNetCore.Identity;
using FlowForge.Application.Services.Authentication;
using FlowForge.Infrastructure.Services.Authentication;
using FlowForge.Application.Features.Projects;
using FlowForge.Application.Features.Boards;

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
        
        services.AddScoped<IAuthService, AuthService>();

        services.AddScoped<ITokenService, TokenService>();

        services.AddHttpContextAccessor();

        services.AddScoped<ICurrentUserService, CurrentUserService>();

        services.AddScoped<ProjectRules>();

        services.AddScoped<BoardRules>();

        services.AddIdentity<ApplicationUser, IdentityRole<Guid>>(options =>
        {
            options.Password.RequiredLength = 8;
            options.Password.RequireDigit = true;
            options.Password.RequireUppercase = true;
            options.Password.RequireLowercase = true;
            options.Password.RequireNonAlphanumeric = false;

            options.User.RequireUniqueEmail = true;
        })
        .AddEntityFrameworkStores<ApplicationDbContext>().AddDefaultTokenProviders();

        return services;
    }
}