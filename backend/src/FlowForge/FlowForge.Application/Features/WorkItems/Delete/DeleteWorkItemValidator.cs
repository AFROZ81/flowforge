using FluentValidation;

namespace FlowForge.Application.Features.WorkItems.Delete;

public sealed class DeleteWorkItemValidator : AbstractValidator<DeleteWorkItemCommand>
{
    public DeleteWorkItemValidator()
    {
        RuleFor(x => x.WorkItemId).NotEmpty();
    }
}
