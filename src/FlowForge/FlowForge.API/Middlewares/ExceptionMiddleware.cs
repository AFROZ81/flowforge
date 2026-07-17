using System.Net;
using System.Text.Json;

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
            InvalidOperationException => (int)HttpStatusCode.BadRequest, _ => (int)HttpStatusCode.InternalServerError
        };

        var response = new
        {
            StatusCode = context.Response.StatusCode,
            Message = exception.Message
        };

        await context.Response.WriteAsync(JsonSerializer.Serialize(response));
    }
}