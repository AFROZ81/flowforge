using FluentValidation;

namespace FlowForge.Application.Features.Organizations.Delete;

public sealed class DeleteOrganizationValidator : AbstractValidator<DeleteOrganizationCommand>
{
    public DeleteOrganizationValidator()
    {
        RuleFor(x => x.ConfirmationSlug)
            .NotEmpty()
            .MaximumLength(150);
    }
}
