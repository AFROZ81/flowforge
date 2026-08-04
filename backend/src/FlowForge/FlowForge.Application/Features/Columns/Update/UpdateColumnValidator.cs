using FluentValidation;

namespace FlowForge.Application.Features.Columns.Update;

public sealed class UpdateColumnValidator : AbstractValidator<UpdateColumnCommand>
{
    public UpdateColumnValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty();

        RuleFor(x => x.Name)
            .NotEmpty()
            .MaximumLength(100);

        RuleFor(x => x.Description)
            .MaximumLength(500);
    }
}