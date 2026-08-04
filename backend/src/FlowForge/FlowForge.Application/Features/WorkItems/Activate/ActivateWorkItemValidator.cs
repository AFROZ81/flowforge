using FluentValidation;

namespace FlowForge.Application.Features.WorkItems.Activate;

public sealed class ActivateWorkItemValidator : AbstractValidator<ActivateWorkItemCommand>
{
    public ActivateWorkItemValidator()
    {
        RuleFor(x => x.WorkItemId)
            .NotEmpty();
    }
}