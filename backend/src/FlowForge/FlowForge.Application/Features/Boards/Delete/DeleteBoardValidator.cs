using FluentValidation;

namespace FlowForge.Application.Features.Boards.Delete;

public sealed class DeleteBoardValidator : AbstractValidator<DeleteBoardCommand>
{
    public DeleteBoardValidator()
    {
        RuleFor(x => x.BoardId).NotEmpty();
    }
}
