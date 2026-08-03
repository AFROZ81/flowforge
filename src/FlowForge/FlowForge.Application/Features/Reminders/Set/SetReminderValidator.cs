using FluentValidation;

namespace FlowForge.Application.Features.Reminders.Set;

public sealed class SetReminderValidator : AbstractValidator<SetReminderCommand>
{
    public SetReminderValidator()
    {
        RuleFor(x => x.WorkItemId)
            .NotEmpty();
    }
}