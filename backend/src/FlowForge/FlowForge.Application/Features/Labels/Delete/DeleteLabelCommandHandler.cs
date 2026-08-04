using FlowForge.Application.Common.Responses;
using FlowForge.Application.Interfaces;
using FlowForge.Application.Services.Authentication;
using FlowForge.Application.Services.WorkItems;
using FlowForge.Application.Services.WorkItemHistories;
using FlowForge.Domain.Enums;
using MediatR;

namespace FlowForge.Application.Features.Labels.Delete;

public sealed class DeleteLabelCommandHandler : IRequestHandler<DeleteLabelCommand, ApiResponse<DeleteLabelResponse>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly LabelRules _labelRules;

    public DeleteLabelCommandHandler(IApplicationDbContext context, ICurrentUserService currentUser, LabelRules labelRules)
    {
        _context = context;
        _currentUser = currentUser;
        _labelRules = labelRules;
    }

    public async Task<ApiResponse<DeleteLabelResponse>> Handle(DeleteLabelCommand request, CancellationToken cancellationToken)
    {
        var currentUser = _currentUser.User;

        var label = await _labelRules.GetByIdAsync(request.LabelId, currentUser.OrganizationId, cancellationToken);

        label.Delete();

        await _context.SaveChangesAsync(cancellationToken);

        return ApiResponse<DeleteLabelResponse>.SuccessResponse(
            new DeleteLabelResponse
            {
                Id = label.Id,
                Name = label.Name,
                IsDeleted = label.IsDeleted,
                DeletedAt = label.DeletedAt
            },
            "Label deleted successfully.");
    }
}