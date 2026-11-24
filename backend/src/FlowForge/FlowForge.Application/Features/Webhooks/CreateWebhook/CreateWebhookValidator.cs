using FluentValidation;

namespace FlowForge.Application.Features.Webhooks.CreateWebhook;

/// <summary>
/// Validator for <see cref="CreateWebhookRequest"/>.
/// </summary>
public sealed class CreateWebhookValidator : AbstractValidator<CreateWebhookRequest>
{
    public CreateWebhookValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Name is required.")
            .MaximumLength(100).WithMessage("Name must not exceed 100 characters.");

        RuleFor(x => x.Url)
            .NotEmpty().WithMessage("URL is required.")
            .Must(BeValidUrl).WithMessage("URL must be a valid HTTP/HTTPS URL.")
            .MaximumLength(500).WithMessage("URL must not exceed 500 characters.");

        RuleFor(x => x.Secret)
            .MaximumLength(100).WithMessage("Secret must not exceed 100 characters.")
            .When(x => !string.IsNullOrEmpty(x.Secret));

        RuleFor(x => x.EventTypes)
            .NotEmpty().WithMessage("Event types are required.")
            .MaximumLength(1000).WithMessage("Event types must not exceed 1000 characters.")
            .Must(BeValidEventTypes).WithMessage("Event types must be valid enum values.");
    }

    private static bool BeValidUrl(string url)
    {
        if (string.IsNullOrWhiteSpace(url))
            return false;

        return Uri.TryCreate(url, UriKind.Absolute, out var uri)
            && (uri.Scheme == Uri.UriSchemeHttp || uri.Scheme == Uri.UriSchemeHttps);
    }

    private static bool BeValidEventTypes(string eventTypes)
    {
        if (string.IsNullOrWhiteSpace(eventTypes))
            return false;

        var types = eventTypes.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

        foreach (var type in types)
        {
            if (!Enum.TryParse<FlowForge.Domain.Enums.WebhookEventType>(type, true, out _))
                return false;
        }

        return true;
    }
}