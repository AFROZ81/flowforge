using FluentValidation;

namespace FlowForge.Application.Features.WorkItems.Move;

public sealed class MoveWorkItemValidator : AbstractValidator<MoveWorkItemCommand>
{
    public MoveWorkItemValidator()
    {
        RuleFor(x => x.WorkItemId)
            .NotEmpty();

        RuleFor(x => x.DestinationColumnId)
            .NotEmpty();

        RuleFor(x => x.DestinationIndex)
            .GreaterThanOrEqualTo(0);
    }
}