using FlowForge.Application.Services.Attachments;
using FlowForge.Application.Services.Authentication;
using MediatR;

namespace FlowForge.Application.Features.Attachments.Download;

public sealed class DownloadAttachmentQueryHandler : IRequestHandler<DownloadAttachmentQuery, DownloadAttachmentResponse>
{
    private readonly ICurrentUserService _currentUser;
    private readonly AttachmentRules _attachmentRules;
    private readonly IFileStorageService _fileStorage;

    public DownloadAttachmentQueryHandler(ICurrentUserService currentUser, AttachmentRules attachmentRules, IFileStorageService fileStorage)
    {
        _currentUser = currentUser;
        _attachmentRules = attachmentRules;
        _fileStorage = fileStorage;
    }

    public async Task<DownloadAttachmentResponse> Handle(DownloadAttachmentQuery request, CancellationToken cancellationToken)
    {
        var currentUser = _currentUser.User;

        var attachment = await _attachmentRules.GetByIdAsync(request.AttachmentId, currentUser.OrganizationId, cancellationToken);

        var stream = await _fileStorage.OpenReadAsync(attachment.StoragePath, cancellationToken);

        return new DownloadAttachmentResponse
        {
            Content = stream,
            FileName = attachment.FileName,
            ContentType = attachment.ContentType
        };
    }
}