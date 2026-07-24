using FluentValidation;

namespace FlowForge.Application.Features.WorkItems.Rename;

public sealed class RenameWorkItemValidator : AbstractValidator<RenameWorkItemCommand>
{
    public RenameWorkItemValidator()
    {
        RuleFor(x => x.WorkItemId)
            .NotEmpty();

        RuleFor(x => x.Title)
            .NotEmpty()
            .MaximumLength(200);
    }
}