using FluentValidation;
using FlowForge.Domain.Enums;

namespace FlowForge.Application.Features.Organizations.Invitations.Create;

/// <summary>
/// Validator for <see cref="CreateInvitationRequest"/>.
/// </summary>
public sealed class CreateInvitationValidator : AbstractValidator<CreateInvitationRequest>
{
    public CreateInvitationValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email is required.")
            .EmailAddress().WithMessage("Invalid email address.")
            .MaximumLength(256).WithMessage("Email must not exceed 256 characters.");

        RuleFor(x => x.Role)
            .IsInEnum().WithMessage("Invalid role.");

        RuleFor(x => x.Message)
            .MaximumLength(500).WithMessage("Message must not exceed 500 characters.")
            .When(x => !string.IsNullOrEmpty(x.Message));
    }
}