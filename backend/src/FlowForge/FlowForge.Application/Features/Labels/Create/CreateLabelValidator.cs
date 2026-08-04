using FluentValidation;

namespace FlowForge.Application.Features.Labels.Create;

public sealed class CreateLabelValidator : AbstractValidator<CreateLabelCommand>
{
    public CreateLabelValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty()
            .MaximumLength(100);

        RuleFor(x => x.Color)
            .NotEmpty()
            .Matches("^#[0-9A-Fa-f]{6}$")
            .WithMessage(
                "Color must be a valid hex color in #RRGGBB format.");

        RuleFor(x => x.Description)
            .MaximumLength(500);
    }
}