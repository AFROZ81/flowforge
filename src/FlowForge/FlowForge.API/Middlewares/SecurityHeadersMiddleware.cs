namespace FlowForge.API.Middlewares;

public sealed class SecurityHeadersMiddleware
{
    private readonly RequestDelegate _next;

    public SecurityHeadersMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        context.Response.OnStarting(() =>
        {
            var headers = context.Response.Headers;

            headers["X-Content-Type-Options"] = "nosniff";
            headers["X-Frame-Options"] = "DENY";
            headers["Referrer-Policy"] = "strict-origin-when-cross-origin";

            headers["X-Permitted-Cross-Domain-Policies"] = "none";

            headers["Permissions-Policy"] =
                "camera=(), microphone=(), geolocation=()";

            headers["Cross-Origin-Opener-Policy"] = "same-origin";

            headers["Cross-Origin-Resource-Policy"] = "same-origin";

            headers["Cross-Origin-Embedder-Policy"] = "require-corp";

            return Task.CompletedTask;
        });

        await _next(context);
    }
}