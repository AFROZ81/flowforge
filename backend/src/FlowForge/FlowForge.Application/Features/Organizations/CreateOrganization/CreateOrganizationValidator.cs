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
            .MaximumLength(150)
            .Matches("^[a-z0-9]+(?:-[a-z0-9]+)*$")
            .WithMessage("Slug can contain lowercase letters, numbers, and single hyphens only.");

        RuleFor(x => x.Description)
            .MaximumLength(1000);
    }
}