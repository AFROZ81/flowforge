using FluentValidation;

namespace FlowForge.Application.Features.Attachments.Upload;

public sealed class UploadAttachmentValidator : AbstractValidator<UploadAttachmentCommand>
{
    private const long MaxFileSize = 10 * 1024 * 1024;

    public UploadAttachmentValidator()
    {
        RuleFor(x => x.WorkItemId)
            .NotEmpty();

        RuleFor(x => x.FileName)
            .NotEmpty()
            .MaximumLength(255);

        RuleFor(x => x.ContentType)
            .NotEmpty()
            .MaximumLength(150);

        RuleFor(x => x.FileSize)
            .GreaterThan(0)
            .LessThanOrEqualTo(MaxFileSize);

        RuleFor(x => x.Content)
            .NotNull();
    }
}