using FluentValidation;

namespace FlowForge.Application.Features.Boards.GetBoardDetails;

public sealed class GetBoardDetailsValidator
    : AbstractValidator<GetBoardDetailsQuery>
{
    public GetBoardDetailsValidator()
    {
        RuleFor(x => x.BoardId)
            .NotEmpty()
            .WithMessage("Board Id is required.");
    }
}