using FluentValidation;

namespace FlowForge.Application.Features.Organizations.CreateOrganization;

/// <summary>
/// Validates requests for creating organizations.
/// </summary>
public sealed class CreateOrganizationValidator : AbstractValidator<CreateOrganizationRequest>
{
    public CreateOrganizationValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty()
            .MaximumLength(150);

        RuleFor(x => x.Slug)
            .NotEmpty()
            .MaximumLength(150);

        RuleFor(x => x.Description)
            .MaximumLength(1000);
    }
}