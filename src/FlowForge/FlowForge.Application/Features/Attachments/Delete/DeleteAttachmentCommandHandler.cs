using FlowForge.Application.Common.Responses;
using FlowForge.Application.Interfaces;
using FlowForge.Application.Services.Attachments;
using FlowForge.Application.Services.Authentication;
using MediatR;

namespace FlowForge.Application.Features.Attachments.Delete;

public sealed class DeleteAttachmentCommandHandler : IRequestHandler<DeleteAttachmentCommand, ApiResponse<DeleteAttachmentResponse>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly AttachmentRules _attachmentRules;
    private readonly IFileStorageService _fileStorage;

    public DeleteAttachmentCommandHandler(IApplicationDbContext context, ICurrentUserService currentUser, AttachmentRules attachmentRules, IFileStorageService fileStorage)
    {
        _context = context;
        _currentUser = currentUser;
        _attachmentRules = attachmentRules;
        _fileStorage = fileStorage;
    }

    public async Task<ApiResponse<DeleteAttachmentResponse>> Handle(DeleteAttachmentCommand request, CancellationToken cancellationToken)
    {
        var currentUser = _currentUser.User;

        var attachment = await _attachmentRules.GetByIdAsync(request.AttachmentId, currentUser.OrganizationId, cancellationToken);

        _attachmentRules.EnsureUploader(attachment, currentUser.UserId);

        _attachmentRules.EnsureWorkItemNotArchived(attachment.WorkItem);

        attachment.Delete();

        await _context.SaveChangesAsync(cancellationToken);

        await _fileStorage.DeleteAsync(attachment.StoragePath, cancellationToken);

        return ApiResponse<DeleteAttachmentResponse>.SuccessResponse(
            new DeleteAttachmentResponse
            {
                Id = attachment.Id,
                WorkItemId = attachment.WorkItemId,
                FileName = attachment.FileName,
                IsDeleted = attachment.IsDeleted,
                DeletedAt = attachment.DeletedAt
            },
            "Attachment deleted successfully.");
    }
}