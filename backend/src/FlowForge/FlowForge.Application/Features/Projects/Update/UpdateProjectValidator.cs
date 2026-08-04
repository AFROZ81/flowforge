using FluentValidation;

namespace FlowForge.Application.Features.Projects.Update;

public sealed class UpdateProjectValidator
    : AbstractValidator<UpdateProjectCommand>
{
    public UpdateProjectValidator()
    {
        RuleFor(x => x.ProjectId)
            .NotEmpty();

        RuleFor(x => x.Name)
            .NotEmpty()
            .MaximumLength(100);

        RuleFor(x => x.Key)
            .NotEmpty()
            .MaximumLength(10);

        RuleFor(x => x.Color)
            .NotEmpty();

        RuleFor(x => x.Icon)
            .NotEmpty();
    }
}