using FluentValidation;

namespace FlowForge.Application.Features.WorkItems.Block;

public sealed class BlockWorkItemValidator : AbstractValidator<BlockWorkItemCommand>
{
    public BlockWorkItemValidator()
    {
        RuleFor(x => x.WorkItemId)
            .NotEmpty();
    }
}