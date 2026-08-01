using FlowForge.Application.Common.Responses;
using FlowForge.Application.Interfaces;
using FlowForge.Application.Services.Attachments;
using FlowForge.Application.Services.Authentication;
using FlowForge.Domain.Entities;
using FlowForge.Application.Services.Notifications;
using FlowForge.Application.Services.WorkItemHistories;
using FlowForge.Domain.Enums;
using MediatR;

namespace FlowForge.Application.Features.Attachments.Upload;

public sealed class UploadAttachmentCommandHandler : IRequestHandler<UploadAttachmentCommand, ApiResponse<UploadAttachmentResponse>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly AttachmentRules _attachmentRules;
    private readonly IFileStorageService _fileStorage;
    private readonly INotificationService _notificationService;
    private readonly IWorkItemHistoryService _historyService;

    public UploadAttachmentCommandHandler(IApplicationDbContext context, ICurrentUserService currentUser, AttachmentRules attachmentRules, IFileStorageService fileStorage, INotificationService notificationService, IWorkItemHistoryService historyService)
    {
        _context = context;
        _currentUser = currentUser;
        _attachmentRules = attachmentRules;
        _fileStorage = fileStorage;
        _notificationService = notificationService;
        _historyService = historyService;
    }

    public async Task<ApiResponse<UploadAttachmentResponse>> Handle(UploadAttachmentCommand request, CancellationToken cancellationToken)
    {
        var currentUser = _currentUser.User;

        var workItem = await _attachmentRules.GetWorkItemAsync(request.WorkItemId, currentUser.OrganizationId, cancellationToken);

        _attachmentRules.EnsureWorkItemNotArchived(workItem);

        var storedFile = await _fileStorage.SaveAsync(request.WorkItemId, 
            new FileUploadRequest
            {
                FileName = request.FileName,
                ContentType = request.ContentType,
                FileSize = request.FileSize,
                Content = request.Content
            },
            cancellationToken);

        try
        {
            var attachment = new Attachment(request.WorkItemId, currentUser.UserId, request.FileName, storedFile.StoredFileName, request.ContentType, request.FileSize, storedFile.StoragePath);

            _context.Attachments.Add(attachment);

            if (workItem.AssigneeId.HasValue && workItem.AssigneeId.Value != currentUser.UserId)
            {
                await _notificationService.CreateAsync(
                    currentUser.OrganizationId,
                    workItem.AssigneeId.Value,
                    NotificationType.AttachmentAdded,
                    "New attachment",
                    $"A new attachment was added to \"{workItem.Title}\".",
                    workItem.Id,
                    cancellationToken);
            }

            await _context.SaveChangesAsync(cancellationToken);

            await _historyService.CreateAsync(
                workItem.Id,
                currentUser.UserId,
                WorkItemHistoryAction.AttachmentAdded,
                $"{currentUser.FullName} uploaded \"{attachment.FileName}\".",
                cancellationToken);

            return ApiResponse<UploadAttachmentResponse>.SuccessResponse(
                new UploadAttachmentResponse
                {
                    Id = attachment.Id,
                    WorkItemId = attachment.WorkItemId,
                    UploadedById = attachment.UploadedById,
                    FileName = attachment.FileName,
                    ContentType = attachment.ContentType,
                    FileSize = attachment.FileSize,
                    CreatedAt = attachment.CreatedAt
                },
                "Attachment uploaded successfully.");
        }
        catch
        {
            await _fileStorage.DeleteAsync(storedFile.StoragePath, CancellationToken.None);
            throw;
        }
    }
}