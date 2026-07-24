using FluentValidation;

namespace FlowForge.Application.Features.WorkItems.Complete;

public sealed class CompleteWorkItemValidator : AbstractValidator<CompleteWorkItemCommand>
{
    public CompleteWorkItemValidator()
    {
        RuleFor(x => x.WorkItemId)
            .NotEmpty();
    }
}