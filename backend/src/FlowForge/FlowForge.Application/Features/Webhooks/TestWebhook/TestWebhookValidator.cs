using FluentValidation;

namespace FlowForge.Application.Features.Webhooks.TestWebhook;

/// <summary>
/// Validator for <see cref="TestWebhookRequest"/>.
/// </summary>
public sealed class TestWebhookValidator : AbstractValidator<TestWebhookRequest>
{
    public TestWebhookValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Webhook ID is required.");
    }
}