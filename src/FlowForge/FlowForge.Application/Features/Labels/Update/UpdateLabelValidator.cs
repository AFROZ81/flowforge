using FluentValidation;

namespace FlowForge.Application.Features.Labels.Update;

public sealed class UpdateLabelValidator : AbstractValidator<UpdateLabelCommand>
{
    public UpdateLabelValidator()
    {
        RuleFor(x => x.LabelId)
            .NotEmpty();

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