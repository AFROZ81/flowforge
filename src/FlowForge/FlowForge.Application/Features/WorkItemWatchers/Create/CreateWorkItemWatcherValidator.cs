using FluentValidation;

namespace FlowForge.Application.Features.WorkItemWatchers.Create;

public sealed class CreateWorkItemWatcherValidator : AbstractValidator<CreateWorkItemWatcherCommand>
{
    public CreateWorkItemWatcherValidator()
    {
        RuleFor(x => x.WorkItemId)
            .NotEmpty();

        RuleFor(x => x.UserId)
            .NotEmpty();
    }
}