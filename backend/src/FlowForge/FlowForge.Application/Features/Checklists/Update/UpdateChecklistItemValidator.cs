using FluentValidation;

namespace FlowForge.Application.Features.Checklists.Update;

public sealed class UpdateChecklistItemValidator : AbstractValidator<UpdateChecklistItemCommand>
{
    public UpdateChecklistItemValidator()
    {
        RuleFor(x => x.ChecklistItemId)
            .NotEmpty();

        RuleFor(x => x.Title)
            .NotEmpty()
            .MaximumLength(500);
    }
}