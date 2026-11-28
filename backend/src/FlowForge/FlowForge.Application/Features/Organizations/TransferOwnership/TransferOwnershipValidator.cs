using FluentValidation;

namespace FlowForge.Application.Features.Organizations.TransferOwnership;

public sealed class TransferOwnershipValidator : AbstractValidator<TransferOwnershipCommand>
{
    public TransferOwnershipValidator()
    {
        RuleFor(x => x.TargetUserId).NotEmpty();
    }
}
