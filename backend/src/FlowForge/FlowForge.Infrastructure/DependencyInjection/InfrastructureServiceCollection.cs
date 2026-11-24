using FlowForge.Application.Interfaces;
using FlowForge.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using FlowForge.Infrastructure.Identity;
using Microsoft.AspNetCore.Identity;
using FlowForge.Application.Services.Authentication;
using FlowForge.Infrastructure.Services.Authentication;
using FlowForge.Application.Services.Organizations;
using FlowForge.Infrastructure.Services.Organizations;
using FlowForge.Application.Features.Projects;
using FlowForge.Application.Features.Boards;
using FlowForge.Application.Features.Columns;
using FlowForge.Application.Services.WorkItems;
using FlowForge.Infrastructure.Services.WorkItems;
using FlowForge.Application.Features.WorkItems;
using FlowForge.Application.Features.Comments;
using FlowForge.Application.Services.Attachments;
using FlowForge.Infrastructure.Services.Attachments;
using FlowForge.Application.Features.Attachments;
using FlowForge.Application.Features.Labels;
using FlowForge.Application.Services.Notifications;
using FlowForge.Infrastructure.Services.Notifications;
using FlowForge.Application.Features.Notifications;
using FlowForge.Application.Services.Users;
using FlowForge.Infrastructure.Services.Users;
using FlowForge.Application.Features.Checklists;
using FlowForge.Application.Features.WorkItemWatchers;
using FlowForge.Application.Features.WorkItemHistories;
using FlowForge.Application.Services.WorkItemHistories;
using FlowForge.Infrastructure.Services.WorkItemHistories;
using FlowForge.Application.Features.Search;
using FlowForge.Application.Features.Reminders;
using FlowForge.Application.Services.Realtime;
using FlowForge.Application.Services.Presence;
using FlowForge.Infrastructure.Services.Presence;
using FlowForge.Application.Services.Storage;
using FlowForge.Infrastructure.Services.Storage;
using FlowForge.Application.Services.AuditLogs;
using FlowForge.Infrastructure.Services.AuditLogs;
using FlowForge.Application.Services;
using FlowForge.Infrastructure.Services;
using StorageLocalFileStorage = FlowForge.Infrastructure.Services.Storage.LocalFileStorageService;
using AttachmentsLocalFileStorage = FlowForge.Infrastructure.Services.Attachments.LocalFileStorageService;

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

        services.AddScoped<IUserLookupService, UserLookupService>();

        services.AddScoped<ProjectRules>();

        services.AddScoped<BoardRules>();

        services.AddScoped<ColumnRules>();

        services.AddScoped<WorkItemRules>();

        services.AddScoped<CommentRules>();

        services.AddScoped<AttachmentRules>();

        services.AddScoped<LabelRules>();

        services.AddScoped<NotificationRules>();

        services.AddScoped<SearchRules>();

        services.AddScoped<ReminderRules>();

        services.AddScoped<IWorkItemOrderingService, WorkItemOrderingService>();

        services.AddScoped<IFileStorageProvider, StorageLocalFileStorage>();

        services.AddScoped<FlowForge.Application.Services.Attachments.IFileStorageService, AttachmentsLocalFileStorage>();

        services.AddScoped<INotificationService, NotificationService>();

        services.AddScoped<IAuditLogService, AuditLogService>();

        services.AddScoped<IEmailService, SmtpEmailService>();

        services.AddScoped<IUserService, UserService>();

        services.AddScoped<ChecklistRules>();

        services.AddScoped<WorkItemWatcherRules>();

        services.AddScoped<WorkItemHistoryRules>();

        services.AddScoped<IWorkItemHistoryService, WorkItemHistoryService>();

        services.AddSingleton<IOnlineUserTracker, OnlineUserTracker>();

        services.AddSingleton<IBoardPresenceTracker, BoardPresenceTracker>();

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