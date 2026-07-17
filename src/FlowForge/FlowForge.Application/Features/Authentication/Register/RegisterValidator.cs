using FluentValidation;

namespace FlowForge.Application.Features.Authentication.Register;

/// <summary>
/// Validates user registration requests.
/// </summary>
public sealed class RegisterValidator : AbstractValidator<RegisterRequest>
{
    public RegisterValidator()
    {
        RuleFor(x => x.FullName)
            .NotEmpty()
            .MaximumLength(100);

        RuleFor(x => x.Email)
            .NotEmpty()
            .EmailAddress();

        RuleFor(x => x.Password)
            .NotEmpty()
            .MinimumLength(8);

        RuleFor(x => x.ConfirmPassword)
            .NotEmpty()
            .Equal(x => x.Password)
            .WithMessage("Passwords do not match.");

        RuleFor(x => x.OrganizationId)
            .NotEqual(Guid.Empty)
            .WithMessage("Organization is required.");
    }
}