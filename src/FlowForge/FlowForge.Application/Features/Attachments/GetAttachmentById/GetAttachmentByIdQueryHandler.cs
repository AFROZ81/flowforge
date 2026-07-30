using FlowForge.Application.Common.Responses;
using FlowForge.Application.Services.Authentication;
using MediatR;

namespace FlowForge.Application.Features.Attachments.GetAttachmentById;

public sealed class GetAttachmentByIdQueryHandler
    : IRequestHandler<
        GetAttachmentByIdQuery,
        ApiResponse<GetAttachmentByIdResponse>>
{
    private readonly ICurrentUserService _currentUser;
    private readonly AttachmentRules _attachmentRules;

    public GetAttachmentByIdQueryHandler(ICurrentUserService currentUser, AttachmentRules attachmentRules)
    {
        _currentUser = currentUser;
        _attachmentRules = attachmentRules;
    }

    public async Task<ApiResponse<GetAttachmentByIdResponse>> Handle(GetAttachmentByIdQuery request, CancellationToken cancellationToken)
    {
        var currentUser = _currentUser.User;

        var attachment = await _attachmentRules.GetByIdAsync(request.Id, currentUser.OrganizationId, cancellationToken);

        return ApiResponse<GetAttachmentByIdResponse>.SuccessResponse(
            new GetAttachmentByIdResponse
            {
                Id = attachment.Id,
                WorkItemId = attachment.WorkItemId,
                UploadedById = attachment.UploadedById,
                FileName = attachment.FileName,
                ContentType = attachment.ContentType,
                FileSize = attachment.FileSize,
                CreatedAt = attachment.CreatedAt
            },
            "Attachment retrieved successfully.");
    }
}