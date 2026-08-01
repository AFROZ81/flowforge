using FluentValidation;

namespace FlowForge.Application.Features.Checklists.Create;

public sealed class CreateChecklistItemValidator : AbstractValidator<CreateChecklistItemCommand>
{
    public CreateChecklistItemValidator()
    {
        RuleFor(x => x.WorkItemId)
            .NotEmpty();

        RuleFor(x => x.Title)
            .NotEmpty()
            .MaximumLength(500);
    }
}