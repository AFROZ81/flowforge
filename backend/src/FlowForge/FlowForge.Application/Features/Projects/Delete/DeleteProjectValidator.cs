using FluentValidation;

namespace FlowForge.Application.Features.Projects.Delete;

public sealed class DeleteProjectValidator : AbstractValidator<DeleteProjectCommand>
{
    public DeleteProjectValidator()
    {
        RuleFor(x => x.ProjectId).NotEmpty();
    }
}
