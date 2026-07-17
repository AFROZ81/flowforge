using System.Net;
using System.Text.Json;
using FlowForge.Application.Common.Responses;
using FlowForge.Application.Common.Exceptions;

namespace FlowForge.API.Middlewares;

/// <summary>
/// Handles all unhandled exceptions in one place.
/// </summary>
public sealed class ExceptionMiddleware
{
    private readonly RequestDelegate _next;

    public ExceptionMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
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

        var response = ApiResponse<object>.FailureResponse(exception.Message);

        await context.Response.WriteAsJsonAsync(response);
    }
}