using FluentValidation;
using FlowForge.Application.Common.Time;

namespace FlowForge.Application.Features.WorkItems.Create;

public sealed class CreateWorkItemValidator
    : AbstractValidator<CreateWorkItemCommand>
{
    public CreateWorkItemValidator()
    {
        RuleFor(x => x.ColumnId)
            .NotEmpty();

        RuleFor(x => x.Title)
            .NotEmpty()
            .MaximumLength(200);

        RuleFor(x => x.Description)
            .MaximumLength(2000);

        RuleFor(x => x.DueDate)
            .Must(date => !date.HasValue || AppTime.DateInIndia(date.Value) >= AppTime.TodayInIndia)
            .WithMessage("Due date cannot be in the past.");
    }
}