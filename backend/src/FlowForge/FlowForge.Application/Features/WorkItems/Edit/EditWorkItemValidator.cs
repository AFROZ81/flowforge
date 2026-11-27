using FluentValidation;
using FlowForge.Application.Common.Time;

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
            .Must(x => !x.HasValue || AppTime.DateInIndia(x.Value) >= AppTime.TodayInIndia)
            .WithMessage("Due date cannot be in the past.");
    }
}