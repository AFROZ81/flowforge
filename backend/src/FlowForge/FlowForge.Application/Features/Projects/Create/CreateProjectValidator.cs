using FluentValidation;

namespace FlowForge.Application.Features.Projects.Create;

public sealed class CreateProjectValidator : AbstractValidator<CreateProjectCommand>
{
    public CreateProjectValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty()
            .MaximumLength(200);

        RuleFor(x => x.Key)
            .NotEmpty()
            .Length(2, 10)
            .Matches("^[A-Z0-9]+$")
            .WithMessage("Project key must contain only uppercase letters and numbers.");

        RuleFor(x => x.Description)
            .MaximumLength(1000);

        RuleFor(x => x.Color)
            .NotEmpty()
            .MaximumLength(20);

        RuleFor(x => x.Icon)
            .MaximumLength(100);
    }
}