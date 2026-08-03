using FlowForge.Application.Common.Exceptions;
using FlowForge.Application.Common.Responses;
using Microsoft.Extensions.Logging;

namespace FlowForge.API.Middlewares;

public sealed class ExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionMiddleware> _logger;

    public ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled exception while processing {Method} {Path}", context.Request.Method, context.Request.Path);

            await HandleExceptionAsync(context, ex);
        }
    }

    private static async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";

        context.Response.StatusCode = exception switch
        {
            BadRequestException => StatusCodes.Status400BadRequest,
            UnauthorizedException => StatusCodes.Status401Unauthorized,
            ForbiddenException => StatusCodes.Status403Forbidden,
            NotFoundException => StatusCodes.Status404NotFound,
            ConflictException => StatusCodes.Status409Conflict,
            _ => StatusCodes.Status500InternalServerError
        };

        var message = exception switch
        {
            BadRequestException
            or UnauthorizedException
            or ForbiddenException
            or NotFoundException
            or ConflictException
                => exception.Message,

            _ => "An unexpected error occurred. Please contact support if the problem persists."
        };

        var response = ApiResponse<object>.FailureResponse(message);

        response.TraceId = context.TraceIdentifier;

        await context.Response.WriteAsJsonAsync(response);
    }
}