using FlowForge.Application.Common.Responses;
using FlowForge.Application.Interfaces;
using FlowForge.Application.Services.Authentication;
using FlowForge.Domain.Entities;
using MediatR;

namespace FlowForge.Application.Features.Comments.Create;

public sealed class CreateCommentCommandHandler : IRequestHandler<CreateCommentCommand, ApiResponse<CreateCommentResponse>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly CommentRules _commentRules;

    public CreateCommentCommandHandler(IApplicationDbContext context, ICurrentUserService currentUser, CommentRules commentRules)
    {
        _context = context;
        _currentUser = currentUser;
        _commentRules = commentRules;
    }

    public async Task<ApiResponse<CreateCommentResponse>> Handle(CreateCommentCommand request, CancellationToken cancellationToken)
    {
        var currentUser = _currentUser.User;

        var workItem = await _commentRules.GetWorkItemAsync(request.WorkItemId, currentUser.OrganizationId, cancellationToken);

        _commentRules.EnsureWorkItemNotArchived(workItem);

        var comment = new Comment(request.WorkItemId, currentUser.UserId, request.Content);

        _context.Comments.Add(comment);

        await _context.SaveChangesAsync(cancellationToken);

        return ApiResponse<CreateCommentResponse>.SuccessResponse(
            new CreateCommentResponse
            {
                Id = comment.Id,
                WorkItemId = comment.WorkItemId,
                AuthorId = comment.AuthorId,
                Content = comment.Content,
                IsEdited = comment.IsEdited,
                CreatedAt = comment.CreatedAt
            },
            "Comment created successfully.");
    }
}