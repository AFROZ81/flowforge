namespace FlowForge.Application.Features.Webhooks.TestWebhook;

/// <summary>
/// Response after testing a webhook subscription.
/// </summary>
public sealed class TestWebhookResponse
{
    /// <summary>
    /// Whether the test was successful.
    /// </summary>
    public bool Success { get; init; }

    /// <summary>
    /// The HTTP status code returned by the webhook endpoint.
    /// </summary>
    public int? StatusCode { get; init; }

    /// <summary>
    /// The response body from the webhook endpoint.
    /// </summary>
    public string? ResponseBody { get; init; }

    /// <summary>
    /// Error message if the test failed.
    /// </summary>
    public string? Error { get; init; }
}