using FluentValidation;

namespace FlowForge.Application.Features.WorkItems.Edit;

public sealed class EditWorkItemValidator : AbstractValidator<EditWorkItemCommand>
{
    public EditWorkItemValidator()
    {
        RuleFor(x => x.WorkItemId)
            .NotEmpty();

        RuleFor(x => x.Description)
            .MaximumLength(2000);

        RuleFor(x => x.DueDate)
            .Must(x => !x.HasValue || x.Value.Date >= DateTime.UtcNow.Date)
            .WithMessage("Due date cannot be in the past.");
    }
}