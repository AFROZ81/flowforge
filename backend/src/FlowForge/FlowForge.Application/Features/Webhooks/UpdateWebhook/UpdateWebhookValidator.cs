using FluentValidation;

namespace FlowForge.Application.Features.Webhooks.UpdateWebhook;

/// <summary>
/// Validator for <see cref="UpdateWebhookRequest"/>.
/// </summary>
public sealed class UpdateWebhookValidator : AbstractValidator<UpdateWebhookRequest>
{
    public UpdateWebhookValidator()
    {
        RuleFor(x => x.Name)
            .MaximumLength(100).WithMessage("Name must not exceed 100 characters.")
            .When(x => !string.IsNullOrEmpty(x.Name));

        RuleFor(x => x.Url)
            .Must(BeValidUrl).WithMessage("URL must be a valid HTTP/HTTPS URL.")
            .MaximumLength(500).WithMessage("URL must not exceed 500 characters.")
            .When(x => !string.IsNullOrEmpty(x.Url));

        RuleFor(x => x.Secret)
            .MaximumLength(100).WithMessage("Secret must not exceed 100 characters.")
            .When(x => !string.IsNullOrEmpty(x.Secret));

        RuleFor(x => x.EventTypes)
            .MaximumLength(1000).WithMessage("Event types must not exceed 1000 characters.")
            .Must(BeValidEventTypes).WithMessage("Event types must be valid enum values.")
            .When(x => !string.IsNullOrEmpty(x.EventTypes));
    }

    private static bool BeValidUrl(string? url)
    {
        if (string.IsNullOrWhiteSpace(url))
            return true;

        return Uri.TryCreate(url, UriKind.Absolute, out var uri)
            && (uri.Scheme == Uri.UriSchemeHttp || uri.Scheme == Uri.UriSchemeHttps);
    }

    private static bool BeValidEventTypes(string? eventTypes)
    {
        if (string.IsNullOrWhiteSpace(eventTypes))
            return true;

        var types = eventTypes.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

        foreach (var type in types)
        {
            if (!Enum.TryParse<FlowForge.Domain.Enums.WebhookEventType>(type, true, out _))
                return false;
        }

        return true;
    }
}