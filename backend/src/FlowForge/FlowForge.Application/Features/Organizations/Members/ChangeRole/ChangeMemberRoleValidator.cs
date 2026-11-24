using FluentValidation;

namespace FlowForge.Application.Features.Organizations.Members.ChangeRole;

/// <summary>
/// Validator for <see cref="ChangeMemberRoleRequest"/>.
/// </summary>
public sealed class ChangeMemberRoleValidator : AbstractValidator<ChangeMemberRoleRequest>
{
    public ChangeMemberRoleValidator()
    {
        RuleFor(x => x.Role)
            .IsInEnum()
            .WithMessage("Invalid role specified.");
    }
}