using FlowForge.API.Middlewares;
using FlowForge.Application.Behaviors;
using FlowForge.Application.Common.Settings;
using FlowForge.Application.DependencyInjection;
using FlowForge.Infrastructure.DependencyInjection;
using FlowForge.Infrastructure.Persistence;
using FlowForge.Application.Common.Responses;
using FlowForge.API.Hubs;
using FlowForge.API.SignalR;
using FlowForge.API.Services.Realtime;
using FlowForge.Application.Services.Realtime;

using FluentValidation;
using FluentValidation.AspNetCore;

using MediatR;

using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.ResponseCompression;
using Microsoft.AspNetCore.SignalR;

using System.IO.Compression;
using System.Text;
using System.Threading.RateLimiting;

using Serilog;


var builder = WebApplication.CreateBuilder(args);


// ============================================================
// SERILOG
// ============================================================

Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .CreateLogger();

builder.Host.UseSerilog();


// ============================================================
// SERVICES
// ============================================================

builder.Services.AddControllers();


// ============================================================
// SIGNALR
// ============================================================

builder.Services.AddSignalR();

builder.Services.AddSingleton<IUserIdProvider, SignalRUserIdProvider>();


// ============================================================
// HEALTH CHECKS
// ============================================================

builder.Services
    .AddHealthChecks()
    .AddDbContextCheck<ApplicationDbContext>(
        "SQL Server",
        tags: new[] { "database" }
    );


// ============================================================
// API EXPLORER
// ============================================================

builder.Services.AddEndpointsApiExplorer();


// ============================================================
// SWAGGER
// ============================================================

builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc(
        "v1",
        new Microsoft.OpenApi.Models.OpenApiInfo
        {
            Title = "FlowForge API",
            Version = "v1",
            Description =
                "FlowForge Project Management Platform API"
        }
    );

    options.AddSecurityDefinition(
        "Bearer",
        new Microsoft.OpenApi.Models.OpenApiSecurityScheme
        {
            Name = "Authorization",
            Type =
                Microsoft.OpenApi.Models.SecuritySchemeType.Http,
            Scheme = "bearer",
            BearerFormat = "JWT",
            In =
                Microsoft.OpenApi.Models.ParameterLocation.Header,
            Description = "Enter JWT token"
        }
    );

    options.AddSecurityRequirement(
        new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
        {
            {
                new Microsoft.OpenApi.Models.OpenApiSecurityScheme
                {
                    Reference =
                        new Microsoft.OpenApi.Models.OpenApiReference
                        {
                            Type =
                                Microsoft.OpenApi.Models.ReferenceType
                                    .SecurityScheme,

                            Id = "Bearer"
                        }
                },

                Array.Empty<string>()
            }
        }
    );
});


// ============================================================
// INFRASTRUCTURE
// ============================================================

builder.Services.AddInfrastructure(
    builder.Configuration
);


// ============================================================
// REALTIME SERVICES
// ============================================================

builder.Services.AddScoped<
    IRealtimeNotifier,
    SignalRNotifier
>();


// ============================================================
// JWT SETTINGS
// ============================================================

builder.Services.Configure<JwtSettings>(
    builder.Configuration.GetSection(
        JwtSettings.SectionName
    )
);

var jwtSettings =
    builder.Configuration
        .GetSection(JwtSettings.SectionName)
        .Get<JwtSettings>()
    ?? throw new InvalidOperationException(
        "JWT configuration is missing."
    );


// ============================================================
// AUTHENTICATION
// ============================================================

builder.Services
    .AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme =
            JwtBearerDefaults.AuthenticationScheme;

        options.DefaultChallengeScheme =
            JwtBearerDefaults.AuthenticationScheme;

        options.DefaultScheme =
            JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters =
            new TokenValidationParameters
            {
                ValidateIssuer = true,

                ValidIssuer =
                    jwtSettings.Issuer,


                ValidateAudience = true,

                ValidAudience =
                    jwtSettings.Audience,


                ValidateIssuerSigningKey = true,

                IssuerSigningKey =
                    new SymmetricSecurityKey(
                        Encoding.UTF8.GetBytes(
                            jwtSettings.Key
                        )
                    ),


                ValidateLifetime = true,

                ClockSkew =
                    TimeSpan.Zero
            };


        // ====================================================
        // SIGNALR JWT AUTHENTICATION
        // ====================================================

        options.Events =
            new JwtBearerEvents
            {
                OnMessageReceived =
                    context =>
                    {
                        var accessToken =
                            context.Request.Query[
                                "access_token"
                            ]
                            .FirstOrDefault();

                        var path =
                            context.HttpContext.Request.Path;


                        /*
                         * =================================================
                         * SIGNALR CONNECTION
                         * =================================================
                         *
                         * SignalR can send the JWT through:
                         *
                         * Authorization:
                         *     Bearer eyJ...
                         *
                         * OR:
                         *
                         * ?access_token=eyJ...
                         *
                         * We support both.
                         */


                        if (
                            !string.IsNullOrWhiteSpace(
                                accessToken
                            )
                            &&
                            path.StartsWithSegments(
                                "/hubs/notifications"
                            )
                        )
                        {
                            context.Token =
                                accessToken;

                            Log.Information(
                                "SignalR JWT received through access_token query parameter."
                            );

                            return Task.CompletedTask;
                        }


                        /*
                         * =================================================
                         * AUTHORIZATION HEADER
                         * =================================================
                         *
                         * This is primarily useful for:
                         *
                         * /negotiate
                         *
                         * where SignalR normally sends:
                         *
                         * Authorization: Bearer <token>
                         */


                        var authorizationHeader =
                            context.Request.Headers[
                                "Authorization"
                            ].FirstOrDefault();


                        if (
                            !string.IsNullOrWhiteSpace(
                                authorizationHeader
                            )
                            &&
                            authorizationHeader.StartsWith(
                                "Bearer ",
                                StringComparison.OrdinalIgnoreCase
                            )
                        )
                        {
                            var headerToken =
                                authorizationHeader[
                                    "Bearer ".Length..]
                                .Trim();


                            if (
                                !string.IsNullOrWhiteSpace(
                                    headerToken
                                )
                            )
                            {
                                context.Token =
                                    headerToken;

                                Log.Information(
                                    "JWT received through Authorization header."
                                );
                            }
                        }


                        return Task.CompletedTask;
                    },


                // ====================================================
                // AUTHENTICATION FAILED
                // ====================================================

                OnAuthenticationFailed =
                    context =>
                    {
                        Log.Error(
                            context.Exception,
                            "JWT authentication failed. Path: {Path}",
                            context.HttpContext.Request.Path
                        );

                        return Task.CompletedTask;
                    },


                // ====================================================
                // TOKEN VALIDATED
                // ====================================================

                OnTokenValidated =
                    context =>
                    {
                        var userId =
                            context.Principal?
                                .FindFirst(
                                    System.Security.Claims.ClaimTypes.NameIdentifier
                                )?.Value
                            ??
                            context.Principal?
                                .FindFirst(
                                    "sub"
                                )?.Value;


                        Log.Information(
                            "JWT token validated successfully. UserId: {UserId}, Path: {Path}",
                            userId,
                            context.HttpContext.Request.Path
                        );


                        return Task.CompletedTask;
                    }
            };
    });


// ============================================================
// AUTHORIZATION
// ============================================================

builder.Services.AddAuthorization();


// ============================================================
// AUTHENTICATION LOGGING
// ============================================================

builder.Services.PostConfigure<AuthenticationOptions>(
    options =>
    {
        Log.Information(
            "DefaultAuthenticateScheme: {Scheme}",
            options.DefaultAuthenticateScheme
        );

        Log.Information(
            "DefaultChallengeScheme: {Scheme}",
            options.DefaultChallengeScheme
        );

        Log.Information(
            "DefaultScheme: {Scheme}",
            options.DefaultScheme
        );
    }
);


// ============================================================
// COOKIE AUTHENTICATION BEHAVIOR
// ============================================================

builder.Services.ConfigureApplicationCookie(
    options =>
    {
        options.Events.OnRedirectToLogin =
            context =>
            {
                context.Response.StatusCode =
                    StatusCodes.Status401Unauthorized;

                return Task.CompletedTask;
            };


        options.Events.OnRedirectToAccessDenied =
            context =>
            {
                context.Response.StatusCode =
                    StatusCodes.Status403Forbidden;

                return Task.CompletedTask;
            };
    }
);


// ============================================================
// MEDIATR
// ============================================================

builder.Services.AddMediatR(cfg =>
{
    cfg.RegisterServicesFromAssembly(
        typeof(ApplicationAssemblyReference).Assembly
    );
});


// ============================================================
// FLUENT VALIDATION
// ============================================================

builder.Services.AddValidatorsFromAssembly(
    typeof(ApplicationAssemblyReference).Assembly
);

builder.Services.AddTransient(
    typeof(IPipelineBehavior<,>),
    typeof(ValidationBehavior<,>)
);


// ============================================================
// RATE LIMITING
// ============================================================

builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode =
        StatusCodes.Status429TooManyRequests;


    options.OnRejected =
        async (
            context,
            cancellationToken
        ) =>
        {
            context.HttpContext
                .Response.Headers.RetryAfter =
                "60";


            await context.HttpContext
                .Response
                .WriteAsJsonAsync(
                    ApiResponse<object>
                        .FailureResponse(
                            "Too many requests. Please try again later."
                        ),
                    cancellationToken
                );
        };


    options.GlobalLimiter =
        PartitionedRateLimiter.Create<
            HttpContext,
            string
        >(
            httpContext =>
            {
                var key =
                    httpContext.User
                        .Identity?
                        .IsAuthenticated == true

                        ? httpContext.User
                            .Identity!
                            .Name
                            ?? "authenticated"

                        : httpContext.Connection
                            .RemoteIpAddress?
                            .ToString()
                            ?? "anonymous";


                return RateLimitPartition
                    .GetFixedWindowLimiter(
                        key,
                        _ =>
                            new FixedWindowRateLimiterOptions
                            {
                                PermitLimit = 100,

                                Window =
                                    TimeSpan.FromMinutes(
                                        1
                                    ),

                                QueueLimit = 0,

                                AutoReplenishment = true
                            }
                    );
            }
        );


    options.AddPolicy(
        "LoginPolicy",
        httpContext =>
        {
            var key =
                httpContext.Connection
                    .RemoteIpAddress?
                    .ToString()
                ?? "anonymous";


            return RateLimitPartition
                .GetFixedWindowLimiter(
                    key,
                    _ =>
                        new FixedWindowRateLimiterOptions
                        {
                            PermitLimit = 5,

                            Window =
                                TimeSpan.FromMinutes(
                                    1
                                ),

                            QueueLimit = 0,

                            AutoReplenishment = true
                        }
                );
        }
    );
});


// ============================================================
// RESPONSE COMPRESSION
// ============================================================

builder.Services.AddResponseCompression(
    options =>
    {
        options.EnableForHttps = true;

        options.Providers.Add<
            BrotliCompressionProvider
        >();

        options.Providers.Add<
            GzipCompressionProvider
        >();

        options.MimeTypes =
            ResponseCompressionDefaults
                .MimeTypes
                .Concat(
                    new[]
                    {
                        "application/json"
                    }
                );
    }
);


builder.Services.Configure<
    BrotliCompressionProviderOptions
>(
    options =>
    {
        options.Level =
            CompressionLevel.Fastest;
    }
);


builder.Services.Configure<
    GzipCompressionProviderOptions
>(
    options =>
    {
        options.Level =
            CompressionLevel.Fastest;
    }
);


// ============================================================
// CORS
// ============================================================

builder.Services.AddCors(
    options =>
    {
        options.AddPolicy(
            "AllowFrontend",
            policy =>
            {
                policy
                    .WithOrigins(
                        "http://localhost:5173"
                    )
                    .AllowAnyHeader()
                    .AllowAnyMethod()
                    .AllowCredentials();
            }
        );
    }
);


// ============================================================
// BUILD
// ============================================================

var app = builder.Build();


// ============================================================
// ROOT
// ============================================================

app.MapGet(
    "/",
    () => Results.Redirect("/swagger")
);


// ============================================================
// DEVELOPMENT
// ============================================================

if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();

    app.UseSwagger();

    app.UseSwaggerUI();
}


// ============================================================
// CUSTOM MIDDLEWARE
// ============================================================

app.UseMiddleware<CorrelationIdMiddleware>();

app.UseMiddleware<ExceptionMiddleware>();

app.UseMiddleware<SecurityHeadersMiddleware>();


// ============================================================
// HTTPS
// ============================================================

app.UseHttpsRedirection();


// ============================================================
// CORS
// ============================================================

app.UseCors(
    "AllowFrontend"
);


// ============================================================
// RESPONSE COMPRESSION
// ============================================================

app.UseResponseCompression();


// ============================================================
// RATE LIMITING
// ============================================================

app.UseRateLimiter();


// ============================================================
// SERILOG
// ============================================================

app.UseSerilogRequestLogging();


// ============================================================
// AUTHENTICATION
// ============================================================

app.UseAuthentication();


// ============================================================
// AUTHORIZATION
// ============================================================

app.UseAuthorization();


// ============================================================
// STATIC FILES
// ============================================================

app.UseDefaultFiles();

app.UseStaticFiles();


// ============================================================
// API CONTROLLERS
// ============================================================

app.MapControllers();


// ============================================================
// SIGNALR HUB
// ============================================================

app.MapHub<NotificationHub>(
    "/hubs/notifications"
);


// ============================================================
// HEALTH CHECK
// ============================================================

app.MapHealthChecks(
    "/health"
);


// ============================================================
// RUN
// ============================================================

try
{
    Log.Information(
        "Starting FlowForge API"
    );

    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(
        ex,
        "Application terminated unexpectedly"
    );
}
finally
{
    Log.CloseAndFlush();
}