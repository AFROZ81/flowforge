using FlowForge.Application.Common.Responses;
using FlowForge.Application.Interfaces;
using FlowForge.Application.Services.Authentication;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FlowForge.Application.Features.Comments.GetCommentsByWorkItem;

public sealed class GetCommentsByWorkItemQueryHandler : IRequestHandler<GetCommentsByWorkItemQuery, ApiResponse<List<GetCommentsByWorkItemResponse>>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly CommentRules _commentRules;

    public GetCommentsByWorkItemQueryHandler(IApplicationDbContext context, ICurrentUserService currentUser, CommentRules commentRules)
    {
        _context = context;
        _currentUser = currentUser;
        _commentRules = commentRules;
    }

    public async Task<ApiResponse<List<GetCommentsByWorkItemResponse>>> Handle(GetCommentsByWorkItemQuery request, CancellationToken cancellationToken)
    {
        var currentUser = _currentUser.User;

        // Verify that the WorkItem exists and belongs
        // to the authenticated user's organization.
        await _commentRules.GetWorkItemAsync(request.WorkItemId, currentUser.OrganizationId, cancellationToken);

        var comments = await _context.Comments
            .AsNoTracking()
            .Where(x =>
                x.WorkItemId == request.WorkItemId &&
                !x.IsDeleted)
            .OrderBy(x => x.CreatedAt)
            .Select(x => new GetCommentsByWorkItemResponse
            {
                Id = x.Id,
                WorkItemId = x.WorkItemId,
                AuthorId = x.AuthorId,
                Content = x.Content
            })
            .ToListAsync(cancellationToken);

        return ApiResponse<List<GetCommentsByWorkItemResponse>>
            .SuccessResponse(
                comments,
                "Comments retrieved successfully.");
    }
}