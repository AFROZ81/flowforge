using FluentValidation;

namespace FlowForge.Application.Features.Organizations.SwitchOrganization;

/// <summary>
/// Validator for <see cref="SwitchOrganizationRequest"/>.
/// </summary>
public sealed class SwitchOrganizationValidator : AbstractValidator<SwitchOrganizationRequest>
{
    public SwitchOrganizationValidator()
    {
        RuleFor(x => x.OrganizationId)
            .NotEmpty().WithMessage("Organization ID is required.");
    }
}