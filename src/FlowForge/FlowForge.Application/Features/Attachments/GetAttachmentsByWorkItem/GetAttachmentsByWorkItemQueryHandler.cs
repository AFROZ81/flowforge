using FlowForge.Application.Common.Responses;
using FlowForge.Application.Interfaces;
using FlowForge.Application.Services.Authentication;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FlowForge.Application.Features.Attachments.GetAttachmentsByWorkItem;

public sealed class GetAttachmentsByWorkItemQueryHandler : IRequestHandler<GetAttachmentsByWorkItemQuery, ApiResponse<List<GetAttachmentsByWorkItemResponse>>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly AttachmentRules _attachmentRules;

    public GetAttachmentsByWorkItemQueryHandler(IApplicationDbContext context, ICurrentUserService currentUser, AttachmentRules attachmentRules)
    {
        _context = context;
        _currentUser = currentUser;
        _attachmentRules = attachmentRules;
    }

    public async Task<ApiResponse<List<GetAttachmentsByWorkItemResponse>>> Handle(GetAttachmentsByWorkItemQuery request, CancellationToken cancellationToken)
    {
        var currentUser = _currentUser.User;

        await _attachmentRules.GetWorkItemAsync(request.WorkItemId, currentUser.OrganizationId, cancellationToken);

        var attachments = await _context.Attachments
            .AsNoTracking()
            .Where(x =>
                x.WorkItemId == request.WorkItemId &&
                !x.IsDeleted)
            .OrderBy(x => x.CreatedAt)
            .Select(x => new GetAttachmentsByWorkItemResponse
            {
                Id = x.Id,
                WorkItemId = x.WorkItemId,
                UploadedById = x.UploadedById,
                FileName = x.FileName,
                ContentType = x.ContentType,
                FileSize = x.FileSize,
                CreatedAt = x.CreatedAt
            })
            .ToListAsync(cancellationToken);

        return ApiResponse<List<GetAttachmentsByWorkItemResponse>>.SuccessResponse(attachments, "Attachments retrieved successfully.");
    }
}